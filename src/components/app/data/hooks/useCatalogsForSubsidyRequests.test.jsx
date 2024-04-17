import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import useCatalogsForSubsidyRequest from './useCatalogsForSubsidyRequests';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import useSubscriptions from './useSubscriptions';
import { useBrowseAndRequestConfiguration } from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';

jest.mock('./useSubscriptions');
jest.mock('./useCouponCodes');
jest.mock('./useBrowseAndRequest');

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCouponCodes: jest.fn().mockResolvedValue(null),
  fetchSubscriptions: jest.fn().mockResolvedValue(null),
  fetchBrowseAndRequestConfiguration: jest.fn().mockResolvedValue(null),
}));
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
  shouldShowActivationSuccessMessage: false,
};
const mockCouponsOverviewResponse = [{ id: 123 }];
const mockBrowseAndRequestConfiguration = {
  id: 123,
};

describe('useCatalogsForSubsidyRequests', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useBrowseAndRequestConfiguration.mockReturnValue({ data: mockBrowseAndRequestConfiguration });
    useSubscriptions.mockReturnValue({ data: mockSubscriptionsData });
    useCouponCodes.mockReturnValue({ data: { couponsOverview: mockCouponsOverviewResponse } });
  });
  it('should handle return when subsidy request not enabled for browseAndRequestConfiguration', () => {
    const { result } = renderHook(() => useCatalogsForSubsidyRequest(), { wrapper: Wrapper });
    expect(result.current).toEqual([]);
  });
  it('should handle return when subsidyType is a license', () => {
    const customerAgreement = {
      availableSubscriptionCatalogs: ['test-catalog1', 'test-catalog2'],
    };
    const mockUpdatedSubscriptionsData = {
      ...mockSubscriptionsData,
      customerAgreement,
    };
    const mockUpdatedBrowseAndRequestConfiguration = {
      ...mockBrowseAndRequestConfiguration,
      subsidyType: 'license',
      subsidyRequestsEnabled: true,
    };
    useBrowseAndRequestConfiguration.mockReturnValue({ data: mockUpdatedBrowseAndRequestConfiguration });
    useSubscriptions.mockReturnValue({ data: mockUpdatedSubscriptionsData });
    useCouponCodes.mockReturnValue({ data: { couponsOverview: mockCouponsOverviewResponse } });
    const { result } = renderHook(() => useCatalogsForSubsidyRequest(), { wrapper: Wrapper });

    expect(result.current).toEqual(['test-catalog1', 'test-catalog2']);
  });
  it('should handle return when subsidyType is a coupon', () => {
    const mockUpdatedBrowseAndRequestConfiguration = {
      ...mockBrowseAndRequestConfiguration,
      subsidyType: 'coupon',
      subsidyRequestsEnabled: true,
    };
    const mockUpdatedCouponsOverviewResponse = [{
      id: 1,
      available: false,
      enterpriseCatalogUuid: 'test-catalog1',
    },
    {
      id: 2,
      available: false,
      enterpriseCatalogUuid: 'test-catalog2',
    },
    {
      id: 2,
      available: false,
      enterpriseCatalogUuid: 'test-catalog2',
    },
    {
      id: 3,
      available: false,
      enterpriseCatalogUuid: 'test-catalog3',
    },
    {
      id: 4,
      available: true,
      enterpriseCatalogUuid: 'test-catalog4',
    },
    {
      id: 5,
      available: true,
      enterpriseCatalogUuid: 'test-catalog5',
    },
    {
      id: 6,
      available: true,
      enterpriseCatalogUuid: 'test-catalog6',
    },
    {
      id: 6,
      available: true,
      enterpriseCatalogUuid: 'test-catalog6',
    }];
    useBrowseAndRequestConfiguration.mockReturnValue({ data: mockUpdatedBrowseAndRequestConfiguration });
    useSubscriptions.mockReturnValue({ data: mockSubscriptionsData });
    useCouponCodes.mockReturnValue({ data: { couponsOverview: mockUpdatedCouponsOverviewResponse } });
    const { result } = renderHook(() => useCatalogsForSubsidyRequest(), { wrapper: Wrapper });

    expect(result.current).toEqual(['test-catalog4', 'test-catalog5', 'test-catalog6']);
  });
});
