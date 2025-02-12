import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard } from '../services';
import useBFF from './useBFF';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useEnterpriseFeatures from './useEnterpriseFeatures';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useEnterpriseFeatures');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerDashboard: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => ({
    FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: [],
  })),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCustomerAgreementUuid = uuidv4();
const mockSubscriptionCatalogUuid = uuidv4();
const mockSubscriptionLicenseUuid = uuidv4();
const mockSubscriptionPlanUuid = uuidv4();
const mockActivationKey = uuidv4();
const mockBFFDashboardData = {
  enterpriseCustomerUserSubsidies: {
    subscriptions: {
      customerAgreement: {
        uuid: mockCustomerAgreementUuid,
        availableSubscriptionCatalogs: [
          mockSubscriptionCatalogUuid,
        ],
        defaultEnterpriseCatalogUuid: null,
        netDaysUntilExpiration: 328,
        disableExpirationNotifications: false,
        enableAutoAppliedSubscriptionsWithUniversalLink: true,
        subscriptionForAutoAppliedLicenses: null,
      },
      subscriptionLicenses: [
        {
          uuid: mockSubscriptionLicenseUuid,
          status: 'activated',
          userEmail: 'fake_user@test-email.com',
          activationDate: '2024-04-08T20:49:57.593412Z',
          lastRemindDate: '2024-04-08T20:49:57.593412Z',
          revokedDate: null,
          activationKey: mockActivationKey,
          subscriptionPlan: {
            uuid: mockSubscriptionPlanUuid,
            title: 'Another Subscription Plan',
            enterpriseCatalogUuid: mockSubscriptionCatalogUuid,
            isActive: true,
            isCurrent: true,
            startDate: '2024-01-18T15:09:41Z',
            expirationDate: '2025-03-31T15:09:47Z',
            daysUntilExpiration: 131,
            daysUntilExpirationIncludingRenewals: 131,
            shouldAutoApplyLicenses: false,
          },
        },
      ],
      subscriptionLicensesByStatus: {
        activated: [
          {
            uuid: mockSubscriptionLicenseUuid,
            status: 'activated',
            userEmail: 'fake_user@test-email.com',
            activationDate: '2024-04-08T20:49:57.593412Z',
            lastRemindDate: '2024-04-08T20:49:57.593412Z',
            revokedDate: null,
            activationKey: mockActivationKey,
            subscriptionPlan: {
              uuid: '6e5debf9-a407-4655-98c1-d510880f5fa6',
              title: 'Another Subscription Plan',
              enterpriseCatalogUuid: mockSubscriptionCatalogUuid,
              isActive: true,
              isCurrent: true,
              startDate: '2024-01-18T15:09:41Z',
              expirationDate: '2025-03-31T15:09:47Z',
              daysUntilExpiration: 131,
              daysUntilExpirationIncludingRenewals: 131,
              shouldAutoApplyLicenses: false,
            },
          },
        ],
        assigned: [],
        expired: [],
        revoked: [],
      },
    },
  },
  enterpriseCourseEnrollments: [
    {
      courseRunId: 'course-v1:edX+DemoX+3T2022',
      courseKey: 'edX+DemoX',
      courseType: 'executive-education-2u',
      orgName: 'edX',
      courseRunStatus: 'completed',
      displayName: 'Really original course name',
      emailsEnabled: true,
      certificateDownloadUrl: null,
      created: '2023-06-14T15:48:31.672317Z',
      startDate: '2022-10-26T00:00:00Z',
      endDate: '2022-12-04T23:59:59Z',
      mode: 'unpaid-executive-education',
      isEnrollmentActive: true,
      productSource: '2u',
      enrollBy: null,
      pacing: 'instructor',
      courseRunUrl: 'https://fake-url.com/account?org_id=n0tr3a1',
      resumeCourseRunUrl: null,
      isRevoked: false,
    },
  ],
  errors: [],
  warnings: [],
};

describe('useBFF', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useEnterpriseFeatures.mockReturnValue({ data: { enterpriseLearnerBffEnabled: false } });
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
    useLocation.mockReturnValue({ pathname: '/test-enterprise' });
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise' });
    getConfig.mockReturnValue({
      FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: [mockEnterpriseCustomer.uuid],
    });
  });

  it.each([
    // BFF enabled via customer opt-in (without query options)
    {
      isBFFEnabledForCustomer: true,
      isBFFEnabledForUser: false,
      hasQueryOptions: false,
    },
    // BFF enabled via customer opt-in (with query options)
    {
      isBFFEnabledForCustomer: true,
      isBFFEnabledForUser: false,
      hasQueryOptions: true,
    },
    // BFF enabled via Waffle flag (without query options)
    {
      isBFFEnabledForCustomer: false,
      isBFFEnabledForUser: true,
      hasQueryOptions: false,
    },
    // BFF enabled via Waffle flag (with query options)
    {
      isBFFEnabledForCustomer: false,
      isBFFEnabledForUser: true,
      hasQueryOptions: true,
    },
    // BFF enabled via customer opt-in and Waffle flag (without query options)
    {
      isBFFEnabledForCustomer: true,
      isBFFEnabledForUser: true,
      hasQueryOptions: false,
    },
    // BFF enabled via customer opt-in and Waffle flag (with query options)
    {
      isBFFEnabledForCustomer: true,
      isBFFEnabledForUser: true,
      hasQueryOptions: true,
    },
    // BFF disabled (without query options)
    {
      isBFFEnabledForCustomer: false,
      isBFFEnabledForUser: false,
      hasQueryOptions: false,
    },
    // BFF disabled (with query options)
    {
      isBFFEnabledForCustomer: false,
      isBFFEnabledForUser: false,
      hasQueryOptions: true,
    },
  ])('should handle resolved value correctly for the dashboard route, and the config enabled (%s)', async ({
    isBFFEnabledForCustomer,
    isBFFEnabledForUser,
    hasQueryOptions,
  }) => {
    if (!isBFFEnabledForCustomer) {
      getConfig.mockReturnValue({
        FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: [],
      });
    }
    if (isBFFEnabledForUser) {
      useEnterpriseFeatures.mockReturnValue({ data: { enterpriseLearnerBffEnabled: true } });
    }
    const isBFFEnabled = isBFFEnabledForCustomer || isBFFEnabledForUser;
    const mockFallbackData = { fallback: 'data' };
    const mockSelect = jest.fn(() => {
      if (isBFFEnabled) {
        return mockBFFDashboardData;
      }
      return mockFallbackData;
    });
    const mockFallbackQueryFn = jest.fn().mockReturnValue(mockFallbackData);
    const mockFallbackQueryConfig = {
      queryKey: ['fallback-query'],
      queryFn: mockFallbackQueryFn,
    };
    const mockBFFQueryOptions = {};
    if (hasQueryOptions) {
      mockBFFQueryOptions.select = mockSelect;
      mockFallbackQueryConfig.select = mockSelect;
    }
    const { result, waitForNextUpdate } = renderHook(
      () => useBFF({
        bffQueryOptions: {
          select: mockSelect,
        },
        fallbackQueryConfig: mockFallbackQueryConfig,
      }),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    const expectedData = isBFFEnabled ? mockBFFDashboardData : mockFallbackData;
    expect(result.current).toEqual(
      expect.objectContaining({
        data: expectedData,
        isLoading: false,
        isFetching: false,
      }),
    );

    if (hasQueryOptions) {
      expect(mockSelect).toHaveBeenCalledTimes(1);
      if (isBFFEnabled) {
        // Expects the select function to be called with the resolved BFF data
        expect(mockSelect).toHaveBeenCalledWith(mockBFFDashboardData);
      } else {
        // Expects the select function to be called with the resolved fallback data
        expect(mockSelect).toHaveBeenCalledWith(mockFallbackData);
      }
    }

    if (isBFFEnabled) {
      expect(fetchEnterpriseLearnerDashboard).toHaveBeenCalledTimes(1);
      expect(fetchEnterpriseLearnerDashboard).toHaveBeenCalledWith(
        expect.objectContaining({
          enterpriseSlug: 'test-enterprise',
        }),
      );
      expect(mockFallbackQueryFn).not.toHaveBeenCalled();
    } else {
      expect(fetchEnterpriseLearnerDashboard).not.toHaveBeenCalled();
      expect(mockFallbackQueryFn).toHaveBeenCalledTimes(1);
    }
  });
});
