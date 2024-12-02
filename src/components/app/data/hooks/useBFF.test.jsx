import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform/config';
import { waitFor } from '@testing-library/react';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCourseEnrollments, fetchEnterpriseLearnerDashboard } from '../services';
import useBFF from './useBFF';
import { queryEnterpriseCourseEnrollments, queryEnterpriseLearnerDashboardBFF, resolveBFFQuery } from '../queries';

jest.mock('./useEnterpriseCustomer');
jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  resolveBFFQuery: jest.fn(),
}));
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerDashboard: jest.fn().mockResolvedValue(null),
  fetchEnterpriseCourseEnrollments: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  matchPath: jest.fn(),
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
// TODO: Test with select function passed to to validate args
describe('useBFF', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
    useLocation.mockReturnValue({ pathname: '/test-enterprise' });
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise' });
    resolveBFFQuery.mockReturnValue(null);
    getConfig.mockReturnValue({
      FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: [mockEnterpriseCustomer.uuid],
    });
  });
  it('should handle resolved value correctly for the dashboard route, and the config enabled', async () => {
    resolveBFFQuery.mockReturnValue(queryEnterpriseLearnerDashboardBFF);
    const { result, waitForNextUpdate } = renderHook(() => useBFF({}), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockBFFDashboardData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it.each([
    {
      enterpriseCustomerUuids: [mockEnterpriseCustomer.uuid],
      isCustomerWithBFF: true,
      shouldResolve: true,
    },
    {
      enterpriseCustomerUuids: [mockEnterpriseCustomer.uuid, uuidv4()],
      isCustomerWithBFF: true,
      shouldResolve: true,
    },
    {
      enterpriseCustomerUuids: [uuidv4()],
      isCustomerWithBFF: true,
      shouldResolve: false,
    },
    {
      enterpriseCustomerUuids: [],
      isCustomerWithBFF: true,
      shouldResolve: false,
    },
    {
      enterpriseCustomerUuids: [uuidv4()],
      isCustomerWithBFF: false,
      shouldResolve: true,
    },
    {
      enterpriseCustomerUuids: [],
      isCustomerWithBFF: false,
      shouldResolve: true,
    },
  ])('tests whether the API resolves on the dashboard based on the feature flag (%s)', async ({ enterpriseCustomerUuids, isCustomerWithBFF, shouldResolve }) => {
    if (shouldResolve) {
      resolveBFFQuery.mockReturnValue(
        isCustomerWithBFF ? queryEnterpriseLearnerDashboardBFF : queryEnterpriseCourseEnrollments,
      );
      fetchEnterpriseCourseEnrollments.mockResolvedValue(mockBFFDashboardData.enterpriseCourseEnrollments);
    } else {
      resolveBFFQuery.mockReturnValue(null);
    }
    getConfig.mockReturnValue({
      FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS: enterpriseCustomerUuids,
    });
    if (!shouldResolve) {
      expect(() => {
        const { result } = renderHook(() => useBFF({}), { wrapper: Wrapper });
        return result.current;
      }).toThrow('No BFF query found for the current route and no fallback query provided');
    }

    const { result } = renderHook(() => useBFF({}), { wrapper: Wrapper });
    await waitFor(() => {
      if (shouldResolve && isCustomerWithBFF) {
        expect(result.current).toEqual(
          expect.objectContaining({
            data: mockBFFDashboardData,
            isLoading: false,
            isFetching: false,
          }),
        );
      } else if (shouldResolve) {
        expect(result.current).toEqual(
          expect.objectContaining({
            data: mockBFFDashboardData.enterpriseCourseEnrollments,
            isLoading: false,
            isFetching: false,
          }),
        );
      }
    });
  });
});
