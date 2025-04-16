import { renderHook } from '@testing-library/react';
import useCatalogsForSubsidyRequest from './useCatalogsForSubsidyRequests';
import { getBaseSubscriptionsData } from '../constants';
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
const { baseSubscriptionsData } = getBaseSubscriptionsData();
const mockCouponsOverviewResponse = [{ id: 123 }];
const mockBrowseAndRequestConfiguration = {
  id: 123,
};

describe('useCatalogsForSubsidyRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBrowseAndRequestConfiguration.mockReturnValue({ data: mockBrowseAndRequestConfiguration });
    useSubscriptions.mockReturnValue({ data: baseSubscriptionsData });
    useCouponCodes.mockReturnValue({ data: { couponsOverview: mockCouponsOverviewResponse } });
  });
  it('should handle return when subsidy request not enabled for browseAndRequestConfiguration', () => {
    const { result } = renderHook(() => useCatalogsForSubsidyRequest());
    expect(result.current).toEqual([]);
  });
  it('should handle return when subsidyType is a license', () => {
    const customerAgreement = {
      availableSubscriptionCatalogs: ['test-catalog1', 'test-catalog2'],
    };
    const mockUpdatedSubscriptionsData = {
      ...baseSubscriptionsData,
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
    const { result } = renderHook(() => useCatalogsForSubsidyRequest());

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
    useSubscriptions.mockReturnValue({ data: baseSubscriptionsData });
    useCouponCodes.mockReturnValue({ data: { couponsOverview: mockUpdatedCouponsOverviewResponse } });
    const { result } = renderHook(() => useCatalogsForSubsidyRequest());

    expect(result.current).toEqual(['test-catalog4', 'test-catalog5', 'test-catalog6']);
  });
});
