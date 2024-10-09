import dayjs from 'dayjs';
import MockDate from 'mockdate';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { activateOrAutoApplySubscriptionLicense, fetchSubscriptions } from '.';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';
import { hasValidStartExpirationDates } from '../../../../../utils/common';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  redirect: jest.fn((redirectPath) => redirectPath),
}));

jest.mock('../../../../../config', () => ({
  ...jest.requireActual('../../../../../config'),
  features: {
    ENABLE_AUTO_APPLIED_LICENSES: true,
  },
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
const mockEnterpriseCustomer = {
  uuid: mockEnterpriseId,
  slug: mockEnterpriseSlug,
};
const mockLicenseUUID = 'test-license-uuid';
const mockLicenseActivationKey = 'test-license-activation-key';
const mockSubscriptionPlanUUID = 'test-subscription-plan-uuid';
const mockCustomerAgreement = {
  uuid: 'test-customer-agreement-uuid',
  netDaysUntilExpiration: 35,
};
const APP_CONFIG = {
  LICENSE_MANAGER_URL: 'http://localhost:18170',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

describe('fetchSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      licenseStatus: LICENSE_STATUS.ACTIVATED,
      isSubscriptionPlanActive: true,
      isSubscriptionPlanCurrent: true,
      daysUntilExpiration: 30,
      startDate: dayjs().subtract(15, 'days').toISOString(),
      expirationDate: dayjs().add(30, 'days').toISOString(),
    },
    {
      licenseStatus: LICENSE_STATUS.ACTIVATED,
      isSubscriptionPlanActive: false,
      isSubscriptionPlanCurrent: true,
      daysUntilExpiration: 30,
      startDate: dayjs().subtract(15, 'days').toISOString(),
      expirationDate: dayjs().add(30, 'days').toISOString(),
    },
    {
      licenseStatus: LICENSE_STATUS.ACTIVATED,
      isSubscriptionPlanActive: true,
      isSubscriptionPlanCurrent: false,
      daysUntilExpiration: 0,
      startDate: dayjs().subtract(15, 'days').toISOString(),
      expirationDate: dayjs().toISOString(),
    },
    {
      licenseStatus: LICENSE_STATUS.UNASSIGNED,
      isSubscriptionPlanActive: true,
      isSubscriptionPlanCurrent: true,
      daysUntilExpiration: 30,
      startDate: dayjs().subtract(15, 'days').toISOString(),
      expirationDate: dayjs().add(30, 'days').toISOString(),
    },
  ])('returns subscriptions (%s)', async ({
    licenseStatus,
    isSubscriptionPlanActive,
    isSubscriptionPlanCurrent,
    daysUntilExpiration,
    startDate,
    expirationDate,
  }) => {
    const mockSubscriptionLicense = {
      uuid: 'test-license-uuid',
      status: licenseStatus,
      subscriptionPlan: {
        uuid: 'test-subscription-plan-uuid',
        isActive: isSubscriptionPlanActive,
        isCurrent: isSubscriptionPlanCurrent,
        daysUntilExpiration,
        startDate,
        expirationDate,
      },
    };
    const mockResponse = {
      customerAgreement: {
        uuid: 'test-customer-agreement-uuid',
        disableExpirationNotifications: false,
      },
      results: [mockSubscriptionLicense],
    };
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      include_revoked: true,
      current_plans_only: false,
    });
    const SUBSCRIPTIONS_URL = `${APP_CONFIG.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
    axiosMock.onGet(SUBSCRIPTIONS_URL).reply(200, mockResponse);
    const response = await fetchSubscriptions(mockEnterpriseId);
    const expectedLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [],
    };
    const isLicenseApplicable = (
      licenseStatus !== LICENSE_STATUS.UNASSIGNED
      && isSubscriptionPlanActive
    );
    const updatedMockSubscriptionLicense = {
      ...mockSubscriptionLicense,
      subscriptionPlan: {
        ...mockSubscriptionLicense.subscriptionPlan,
        isCurrent: hasValidStartExpirationDates({ startDate, expirationDate }),
      },
    };
    if (isLicenseApplicable) {
      expectedLicensesByStatus[licenseStatus].push(updatedMockSubscriptionLicense);
    }

    const updatedCustomerAgreement = {
      customerAgreement: { ...mockResponse.customerAgreement },
      results: [updatedMockSubscriptionLicense],
    };
    const expectedResult = {
      customerAgreement: updatedCustomerAgreement.customerAgreement,
      licensesByStatus: expectedLicensesByStatus,
      subscriptionPlan: isLicenseApplicable ? updatedMockSubscriptionLicense.subscriptionPlan : null,
      subscriptionLicense: isLicenseApplicable ? updatedMockSubscriptionLicense : null,
      subscriptionLicenses: [updatedMockSubscriptionLicense],
      shouldShowActivationSuccessMessage: false,
      showExpirationNotifications: true,
    };
    expect(response).toEqual(expectedResult);
  });

  it('handles learner with multiple activated licenses due to a scheduled renewal', async () => {
    const mockRenewalStartDate = dayjs().add(15, 'days');
    const mockRenewalEndDate = mockRenewalStartDate.add(1, 'year');
    const mockSubscriptionLicenseRenewal = {
      uuid: 'test-license-uuid-1',
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        uuid: 'test-subscription-plan-uuid-1',
        isActive: true,
        isCurrent: false,
        daysUntilExpiration: mockRenewalEndDate.diff(mockRenewalStartDate, 'days'),
        startDate: mockRenewalStartDate.toISOString(),
        expirationDate: mockRenewalEndDate.toISOString(),
      },
    };
    const mockCurrentStartDate = mockRenewalStartDate.subtract(30, 'days');
    const mockSubscriptionLicenseCurrent = {
      uuid: 'test-license-uuid-2',
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        uuid: 'test-subscription-plan-uuid-2',
        isActive: true,
        isCurrent: true,
        daysUntilExpiration: mockRenewalStartDate.diff(mockCurrentStartDate, 'days'),
        startDate: mockCurrentStartDate.toISOString(),
        expirationDate: mockRenewalStartDate.toISOString(),
      },
    };
    const mockResponse = {
      customerAgreement: {
        uuid: 'test-customer-agreement-uuid',
        disableExpirationNotifications: false,
      },
      results: [mockSubscriptionLicenseRenewal, mockSubscriptionLicenseCurrent],
    };
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      include_revoked: true,
      current_plans_only: false,
    });
    const SUBSCRIPTIONS_URL = `${APP_CONFIG.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
    axiosMock.onGet(SUBSCRIPTIONS_URL).reply(200, mockResponse);
    const response = await fetchSubscriptions(mockEnterpriseId);
    const expectedLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [],
    };
    expectedLicensesByStatus[LICENSE_STATUS.ACTIVATED].push(mockSubscriptionLicenseCurrent);
    expectedLicensesByStatus[LICENSE_STATUS.ACTIVATED].push(mockSubscriptionLicenseRenewal);

    const expectedResult = {
      customerAgreement: mockResponse.customerAgreement,
      licensesByStatus: expectedLicensesByStatus,
      subscriptionPlan: mockSubscriptionLicenseCurrent.subscriptionPlan,
      subscriptionLicense: mockSubscriptionLicenseCurrent,
      subscriptionLicenses: [mockSubscriptionLicenseCurrent, mockSubscriptionLicenseRenewal],
      shouldShowActivationSuccessMessage: false,
      showExpirationNotifications: true,
    };
    expect(response).toEqual(expectedResult);
  });
});

describe('activateOrAutoApplySubscriptionLicense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockDate.set(new Date());
  });

  it('returns null when there is no customer agreement', async () => {
    const mockSubscriptionsData = {
      customerAgreement: null,
    };
    const result = await activateOrAutoApplySubscriptionLicense({
      enterpriseCustomer: mockEnterpriseCustomer,
      subscriptionsData: mockSubscriptionsData,
      requestUrl: {
        pathname: `/${mockEnterpriseSlug}`,
      },
    });
    expect(result).toBeNull();
  });

  it.each([
    { netDaysUntilExpiration: 0 },
    { netDaysUntilExpiration: -30 },
  ])('returns null when there is customer agreement with no current subscription plans', async ({ netDaysUntilExpiration }) => {
    const mockSubscriptionsData = {
      customerAgreement: {
        netDaysUntilExpiration,
      },
    };
    const result = await activateOrAutoApplySubscriptionLicense({
      enterpriseCustomer: mockEnterpriseCustomer,
      subscriptionsData: mockSubscriptionsData,
      requestUrl: {
        pathname: `/${mockEnterpriseSlug}`,
      },
    });
    expect(result).toBeNull();
  });

  it('returns null with already activated license', async () => {
    const mockLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [
        {
          uuid: 'test-license-uuid',
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: { isCurrent: true },
        },
      ],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [],
    };
    const mockSubscriptionsData = {
      customerAgreement: mockCustomerAgreement,
      licensesByStatus: mockLicensesByStatus,
    };
    const result = await activateOrAutoApplySubscriptionLicense({
      enterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [{
        enterpriseCustomer: mockEnterpriseCustomer,
      }],
      subscriptionsData: mockSubscriptionsData,
      requestUrl: {
        pathname: `/${mockEnterpriseSlug}`,
      },
    });
    expect(result).toBeNull();
  });

  it('returns null with revoked license', async () => {
    const mockLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [
        {
          uuid: 'test-license-uuid',
          status: LICENSE_STATUS.REVOKED,
          subscriptionPlan: { isCurrent: true },
        },
      ],
    };
    const mockSubscriptionsData = {
      customerAgreement: mockCustomerAgreement,
      licensesByStatus: mockLicensesByStatus,
    };
    const result = await activateOrAutoApplySubscriptionLicense({
      enterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [{
        enterpriseCustomer: mockEnterpriseCustomer,
      }],
      subscriptionsData: mockSubscriptionsData,
      requestUrl: {
        pathname: `/${mockEnterpriseSlug}`,
      },
    });
    expect(result).toBeNull();
  });

  it.each([
    { isLicenseActivationRoute: false },
    { isLicenseActivationRoute: true },
  ])('activates a license (%s)', async ({ isLicenseActivationRoute }) => {
    const licenseActivationQueryParams = new URLSearchParams({
      activation_key: mockLicenseActivationKey,
    });
    const ACTIVATE_LICENSE_URL = `${APP_CONFIG.LICENSE_MANAGER_URL}/api/v1/license-activation/?${licenseActivationQueryParams.toString()}`;
    const mockSubscriptionLicense = {
      uuid: mockLicenseUUID,
      status: LICENSE_STATUS.ASSIGNED,
      activationKey: mockLicenseActivationKey,
      subscriptionPlan: { isCurrent: true },
    };
    const mockLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [mockSubscriptionLicense],
      [LICENSE_STATUS.REVOKED]: [],
    };
    const mockSubscriptionsData = {
      customerAgreement: mockCustomerAgreement,
      licensesByStatus: mockLicensesByStatus,
    };
    axiosMock.onPost(ACTIVATE_LICENSE_URL).reply(200, {});
    const mockRequestUrl = {
      pathname: isLicenseActivationRoute
        ? `/${mockEnterpriseSlug}/licenses/${mockLicenseActivationKey}/activate`
        : `/${mockEnterpriseSlug}`,
    };
    try {
      const response = await activateOrAutoApplySubscriptionLicense({
        enterpriseCustomer: mockEnterpriseCustomer,
        subscriptionsData: mockSubscriptionsData,
        requestUrl: mockRequestUrl,
        allLinkedEnterpriseCustomerUsers: [{
          enterpriseCustomer: mockEnterpriseCustomer,
        }],
      });
      expect(response).toEqual({
        ...mockSubscriptionLicense,
        status: LICENSE_STATUS.ACTIVATED,
        activationDate: dayjs().toISOString(),
      });
    } catch (error) {
      if (isLicenseActivationRoute) {
        expect(error).toEqual(`/${mockEnterpriseSlug}`);
      }
    }
  });

  it.each([
    {
      identityProvider: null,
      subscriptionForAutoAppliedLicenses: null,
      enableAutoAppliedSubscriptionsWithUniversalLink: false,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: null,
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: false,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: null,
      enableAutoAppliedSubscriptionsWithUniversalLink: false,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: false,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: false,
      isLinkedToEnterpriseCustomer: true,
      shouldAutoApply: true,
    },
    {
      identityProvider: null,
      subscriptionForAutoAppliedLicenses: null,
      enableAutoAppliedSubscriptionsWithUniversalLink: true,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: null,
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: true,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: null,
      enableAutoAppliedSubscriptionsWithUniversalLink: true,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: true,
      isLinkedToEnterpriseCustomer: false,
      shouldAutoApply: false,
    },
    {
      identityProvider: 'identity-provider',
      subscriptionForAutoAppliedLicenses: mockSubscriptionPlanUUID,
      enableAutoAppliedSubscriptionsWithUniversalLink: true,
      isLinkedToEnterpriseCustomer: true,
      shouldAutoApply: true,
    },
  ])('auto-applies subscription license (%s)', async ({
    identityProvider,
    subscriptionForAutoAppliedLicenses,
    enableAutoAppliedSubscriptionsWithUniversalLink,
    isLinkedToEnterpriseCustomer,
    shouldAutoApply,
  }) => {
    const mockLicensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [],
    };
    const mockCustomerAgreementWithAutoApplied = {
      ...mockCustomerAgreement,
      subscriptionForAutoAppliedLicenses,
      enableAutoAppliedSubscriptionsWithUniversalLink,
    };
    const mockSubscriptionsData = {
      customerAgreement: mockCustomerAgreementWithAutoApplied,
      licensesByStatus: mockLicensesByStatus,
      subscriptionLicense: {
        subscriptionPlan: {
          isCurrent: true,
        },
      },
    };
    const mockSubscriptionPlan = {
      uuid: mockSubscriptionPlanUUID,
    };
    const mockAutoAppliedSubscriptionLicense = {
      uuid: mockLicenseUUID,
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: mockSubscriptionPlan,
    };
    const modifiedMockEnterpriseCustomer = {
      ...mockEnterpriseCustomer,
      identityProvider,
    };
    const AUTO_APPLY_LICENSE_URL = `${APP_CONFIG.LICENSE_MANAGER_URL}/api/v1/customer-agreement/${mockCustomerAgreement.uuid}/auto-apply/`;
    axiosMock.onPost(AUTO_APPLY_LICENSE_URL).reply(200, mockAutoAppliedSubscriptionLicense);
    const response = await activateOrAutoApplySubscriptionLicense({
      enterpriseCustomer: modifiedMockEnterpriseCustomer,
      subscriptionsData: mockSubscriptionsData,
      requestUrl: {
        pathname: `/${mockEnterpriseSlug}`,
      },
      allLinkedEnterpriseCustomerUsers: isLinkedToEnterpriseCustomer ? [{
        enterpriseCustomer: mockEnterpriseCustomer,
      }] : [],
    });
    if (shouldAutoApply) {
      expect(response).toEqual(mockAutoAppliedSubscriptionLicense);
    } else {
      expect(response).toBeNull();
    }
  });
});
