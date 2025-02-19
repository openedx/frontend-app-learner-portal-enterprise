import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard } from '../services';
import useBFF from './useBFF';
import useEnterpriseCustomer from './useEnterpriseCustomer';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useEnterpriseFeatures');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerDashboard: jest.fn().mockResolvedValue(null),
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
  const Wrapper = ({ initialEntries = [], children }) => (
    <QueryClientProvider client={queryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path=":enterpriseSlug" element={children} />
          <Route path=":enterpriseSlug/search" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
  });

  it.each([
    // BFF disabled route (without query options)
    {
      isMatchedRoute: false,
      hasQueryOptions: false,
    },
    // BFF enabled route (without query options)
    {
      isMatchedRoute: true,
      hasQueryOptions: false,
    },
    // BFF enabled route (with query options)
    {
      isMatchedRoute: true,
      hasQueryOptions: true,
    },

    // BFF disabled route(with query options)
    {
      isMatchedRoute: false,
      hasQueryOptions: true,
    },
  ])('should handle resolved value correctly for based on route (%s)', async ({
    isMatchedRoute,
    hasQueryOptions,
  }) => {
    const mockFallbackData = { fallback: 'data' };
    const mockSelect = jest.fn(() => {
      if (isMatchedRoute) {
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
    const initialEntries = isMatchedRoute ? ['/test-enterprise'] : ['/test-enterprise/search'];
    const { result, waitForNextUpdate } = renderHook(
      () => useBFF({
        bffQueryOptions: {
          select: mockSelect,
        },
        fallbackQueryConfig: mockFallbackQueryConfig,
      }),
      {
        wrapper: ({ children }) => (
          <Wrapper initialEntries={initialEntries}>
            {children}
          </Wrapper>
        ),
      },
    );
    await waitForNextUpdate();

    const expectedData = isMatchedRoute ? mockBFFDashboardData : mockFallbackData;
    expect(result.current).toEqual(
      expect.objectContaining({
        data: expectedData,
        isLoading: false,
        isFetching: false,
      }),
    );

    if (hasQueryOptions) {
      expect(mockSelect).toHaveBeenCalledTimes(1);
      if (isMatchedRoute) {
        // Expects the select function to be called with the resolved BFF data
        expect(mockSelect).toHaveBeenCalledWith(mockBFFDashboardData);
      } else {
        // Expects the select function to be called with the resolved fallback data
        expect(mockSelect).toHaveBeenCalledWith(mockFallbackData);
      }
    }

    if (isMatchedRoute) {
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
