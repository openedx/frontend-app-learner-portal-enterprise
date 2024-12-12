import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchSubscriptions, fetchEnterpriseLearnerDashboard } from '../services';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSubscriptions from './useSubscriptions';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { queryEnterpriseLearnerDashboardBFF, resolveBFFQuery } from '../queries';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchSubscriptions: jest.fn().mockResolvedValue(null),
  fetchEnterpriseLearnerDashboard: jest.fn(),
}));
jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  resolveBFFQuery: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const licensesByStatus = {
  [LICENSE_STATUS.ACTIVATED]: [],
  [LICENSE_STATUS.ASSIGNED]: [],
  [LICENSE_STATUS.REVOKED]: [],
};
const mockSubscriptionsData = {
  subscriptionLicenses: [],
  customerAgreement: null,
  subscriptionLicense: null,
  subscriptionPlan: null,
  licensesByStatus,
  showExpirationNotifications: false,
};
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn(),
}));

describe('useSubscriptions', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchSubscriptions.mockResolvedValue(mockSubscriptionsData);
    useLocation.mockReturnValue({ pathname: '/test-enterprise' });
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise' });
    resolveBFFQuery.mockReturnValue(null);
  });

  it.each([
    {
      hasQueryOptions: false,
      isBFFQueryEnabled: false,
    },
    {
      hasQueryOptions: false,
      isBFFQueryEnabled: true,
    },
    {
      hasQueryOptions: true,
      isBFFQueryEnabled: false,
    },
    {
      hasQueryOptions: true,
      isBFFQueryEnabled: true,
    },
  ])('should handle resolved value correctly (%s)', async ({ hasQueryOptions, isBFFQueryEnabled }) => {
    const mockSubscriptionLicense = {
      uuid: 'mock-subscription-license-uuid',
      status: LICENSE_STATUS.ACTIVATED,
      subscriptionPlan: {
        uuid: 'mock-subscription-plan-uuid',
      },
    };
    let mockSelect = jest.fn((data) => data);
    if (isBFFQueryEnabled) {
      mockSelect = jest.fn(({ transformed }) => transformed.subscriptionLicense);
    }
    const queryOptions = hasQueryOptions ? { select: mockSelect } : undefined;
    const mockSubscriptionLicensesByStatus = {
      ...mockSubscriptionsData.licensesByStatus,
      [mockSubscriptionLicense.status]: [mockSubscriptionLicense],
    };
    const mockSubscriptionsDataWithLicense = {
      ...mockSubscriptionsData,
      subscriptionLicenses: [mockSubscriptionLicense],
      customerAgreement: {
        uuid: 'mock-customer-agreement-uuid',
        disableExpirationNotifications: true,
      },
      subscriptionLicense: mockSubscriptionLicense,
      subscriptionPlan: mockSubscriptionLicense.subscriptionPlan,
      licensesByStatus: mockSubscriptionLicensesByStatus,
      showExpirationNotifications: false,
    };
    if (isBFFQueryEnabled) {
      mockSubscriptionsDataWithLicense.subscriptionLicensesByStatus = mockSubscriptionLicensesByStatus;
      delete mockSubscriptionsDataWithLicense.licensesByStatus;
      resolveBFFQuery.mockReturnValue(queryEnterpriseLearnerDashboardBFF);
      fetchEnterpriseLearnerDashboard.mockResolvedValue({
        enterpriseCustomerUserSubsidies: {
          subscriptions: mockSubscriptionsDataWithLicense,
        },
      });
    }
    fetchSubscriptions.mockResolvedValue(mockSubscriptionsDataWithLicense);

    const { result, waitForNextUpdate } = renderHook(
      () => {
        if (queryOptions) {
          return useSubscriptions(queryOptions);
        }
        return useSubscriptions();
      },
      { wrapper: Wrapper },
    );

    await waitForNextUpdate();

    const expectedSubscriptionsdata = {
      ...mockSubscriptionsDataWithLicense,
      licensesByStatus: mockSubscriptionLicensesByStatus,
    };
    delete expectedSubscriptionsdata.subscriptionLicensesByStatus;

    if (hasQueryOptions && isBFFQueryEnabled) {
      expect(mockSelect).toHaveBeenCalledWith({
        original: {
          enterpriseCustomerUserSubsidies: {
            subscriptions: mockSubscriptionsDataWithLicense,
          },
        },
        transformed: expectedSubscriptionsdata,
      });
    }

    expect(result.current).toEqual(
      expect.objectContaining({
        data: hasQueryOptions && isBFFQueryEnabled ? mockSubscriptionLicense : expectedSubscriptionsdata,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
