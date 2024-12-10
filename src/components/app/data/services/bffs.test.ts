import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';

import { v4 as uuidv4 } from 'uuid';
import { camelCaseObject } from '@edx/frontend-platform';
import { enterpriseCustomerFactory } from './data/__factories__';
import { fetchEnterpriseLearnerDashboard, learnerDashboardBFFResponse } from './bffs';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const APP_CONFIG = {
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
};

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory() as Types.EnterpriseCustomer;
const mockCustomerAgreementUuid = uuidv4();
const mockSubscriptionCatalogUuid = uuidv4();
const mockSubscriptionLicenseUuid = uuidv4();
const mockSubscriptionPlanUuid = uuidv4();
const mockActivationKey = uuidv4();

const mockBaseLearnerBFFResponse = {
  enterprise_customer_user_subsidies: {
    subscriptions: {
      customer_agreement: {
        uuid: mockCustomerAgreementUuid,
        available_subscription_catalogs: [
          mockSubscriptionCatalogUuid,
        ],
        default_enterprise_catalog_uuid: null,
        net_days_until_expiration: 328,
        disable_expiration_notifications: false,
        enable_auto_applied_subscriptions_with_universal_link: true,
        subscription_for_auto_applied_licenses: null,
      },
      subscription_licenses: [
        {
          uuid: mockSubscriptionLicenseUuid,
          status: 'activated',
          user_email: 'fake_user@test-email.com',
          activation_date: '2024-04-08T20:49:57.593412Z',
          last_remind_date: '2024-04-08T20:49:57.593412Z',
          revoked_date: null,
          activation_key: mockActivationKey,
          subscription_plan: {
            uuid: mockSubscriptionPlanUuid,
            title: 'Another Subscription Plan',
            enterprise_catalog_uuid: mockSubscriptionCatalogUuid,
            is_active: true,
            is_current: true,
            start_date: '2024-01-18T15:09:41Z',
            expiration_date: '2025-03-31T15:09:47Z',
            days_until_expiration: 131,
            days_until_expiration_including_renewals: 131,
            should_auto_apply_licenses: false,
          },
        },
      ],
      subscription_licenses_by_status: {
        activated: [
          {
            uuid: mockSubscriptionLicenseUuid,
            status: 'activated',
            user_email: 'fake_user@test-email.com',
            activation_date: '2024-04-08T20:49:57.593412Z',
            lastRemind_date: '2024-04-08T20:49:57.593412Z',
            revoked_date: null,
            activation_key: mockActivationKey,
            subscription_plan: {
              uuid: '6e5debf9-a407-4655-98c1-d510880f5fa6',
              title: 'Another Subscription Plan',
              enterprise_catalog_uuid: mockSubscriptionCatalogUuid,
              is_active: true,
              is_current: true,
              start_date: '2024-01-18T15:09:41Z',
              expiration_date: '2025-03-31T15:09:47Z',
              days_until_expiration: 131,
              days_until_expiration_including_renewals: 131,
              should_auto_apply_licenses: false,
            },
          },
        ],
        assigned: [],
        expired: [],
        revoked: [],
      },
    },
  },
  errors: [],
  warnings: [],
};

const mockBFFDashboardResponse = {
  ...mockBaseLearnerBFFResponse,
  enterprise_course_enrollments: [
    {
      course_run_id: 'course-v1:edX+DemoX+3T2022',
      course_key: 'edX+DemoX',
      course_type: 'executive-education-2u',
      org_name: 'edX',
      course_run_status: 'completed',
      display_name: 'Really original course name',
      emails_enabled: true,
      certificate_download_url: null,
      created: '2023-06-14T15:48:31.672317Z',
      start_date: '2022-10-26T00:00:00Z',
      end_date: '2022-12-04T23:59:59Z',
      mode: 'unpaid-executive-education',
      is_enrollment_active: true,
      product_source: '2u',
      enroll_by: null,
      pacing: 'instructor',
      course_run_url: 'https://fake-url.com/account?org_id=n0tr3a1',
      resume_course_run_url: null,
      is_revoked: false,
    },
  ],
};

describe('fetchEnterpriseLearnerDashboard', () => {
  const urlForDashboardBFF = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/dashboard/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it.each([
    {
      enterpriseId: mockEnterpriseCustomer.uuid,
      enterpriseSlug: undefined,
    },
    {
      enterpriseId: undefined,
      enterpriseSlug: mockEnterpriseCustomer.slug,
    },
    {
      enterpriseId: mockEnterpriseCustomer.uuid,
      enterpriseSlug: mockEnterpriseCustomer.slug,
    },
  ])('returns learner dashboard metadata (%s)', async ({
    enterpriseId,
    enterpriseSlug,
  }) => {
    axiosMock.onPost(urlForDashboardBFF).reply(200, mockBFFDashboardResponse);
    const result = await fetchEnterpriseLearnerDashboard({ enterpriseId, enterpriseSlug });
    expect(result).toEqual(camelCaseObject(mockBFFDashboardResponse));
  });

  it.each([
    {
      enterpriseId: mockEnterpriseCustomer.uuid,
      enterpriseSlug: undefined,
    },
    {
      enterpriseId: undefined,
      enterpriseSlug: mockEnterpriseCustomer.slug,
    },
    {
      enterpriseId: mockEnterpriseCustomer.uuid,
      enterpriseSlug: mockEnterpriseCustomer.slug,
    },
    {
      enterpriseId: undefined,
      enterpriseSlug: undefined,
    },
  ])('catches error and returns default dashboard BFF response (%s)', async ({
    enterpriseId,
    enterpriseSlug,
  }) => {
    axiosMock.onPost(urlForDashboardBFF).reply(404, learnerDashboardBFFResponse);
    const result = await fetchEnterpriseLearnerDashboard({ enterpriseId, enterpriseSlug });
    expect(result).toEqual(learnerDashboardBFFResponse);
  });

  it('logs errors and warnings from BFF response', async () => {
    const mockError = {
      developer_message: 'This is a developer message',
    };
    const mockWarning = {
      developer_message: 'This is a developer warning',
    };
    const mockResponseWithErrorsAndWarnings = {
      ...mockBFFDashboardResponse,
      errors: [mockError],
      warnings: [mockWarning],
    };
    axiosMock.onPost(urlForDashboardBFF).reply(200, mockResponseWithErrorsAndWarnings);
    const result = await fetchEnterpriseLearnerDashboard({ enterpriseSlug: mockEnterpriseCustomer.slug });
    expect(result).toEqual(camelCaseObject(mockResponseWithErrorsAndWarnings));

    // Assert the logError and logInfo functions were called with the expected arguments.
    expect(logError).toHaveBeenCalledWith(`BFF Error (${urlForDashboardBFF}): ${mockError.developer_message}`);
    expect(logInfo).toHaveBeenCalledWith(`BFF Warning (${urlForDashboardBFF}): ${mockWarning.developer_message}`);
  });
});
