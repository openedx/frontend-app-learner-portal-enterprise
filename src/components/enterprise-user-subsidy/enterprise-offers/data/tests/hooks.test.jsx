import { renderHook } from '@testing-library/react-hooks';
import { useEnterpriseOffers } from '../hooks';
import * as couponService from '../../../coupons/data/service';
import * as config from '../../../../../config';

jest.mock('../../../coupons/data/service');

const mockEnterpriseUUID = 'enterprise-uuid';
const defaultProps = {
  enterpriseId: mockEnterpriseUUID,
  customerAgreementConfig: undefined,
  isLoadingCustomerAgreementConfig: false,
};

describe('useEnterpriseOffers', () => {
  afterEach(() => jest.clearAllMocks());

  it('does not fetch enterprise coupons if FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false', () => {
    config.features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false;

    const { result } = renderHook(() => useEnterpriseOffers(defaultProps));

    expect(couponService.fetchCouponsOverview).not.toHaveBeenCalled();

    const {
      canEnrollWithEnterpriseOffers,
      isLoading,
    } = result.current;

    expect(canEnrollWithEnterpriseOffers).toEqual(false);
    expect(isLoading).toEqual(false);
  });

  it('returns canEnrollWithEnterpriseOffers = false if the enterprise has coupons', async () => {
    config.features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;

    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [{ uuid: 'coupon-uuid' }],
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(couponService.fetchCouponsOverview).toHaveBeenCalledWith({
      enterpriseId: mockEnterpriseUUID,
    });

    const {
      canEnrollWithEnterpriseOffers,
      isLoading,
    } = result.current;

    expect(isLoading).toEqual(false);

    expect(canEnrollWithEnterpriseOffers).toEqual(false);
    expect(isLoading).toEqual(false);
  });

  it('returns canEnrollWithEnterpriseOffers = false if the enterprise has subs', async () => {
    config.features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;

    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      ...defaultProps,
      customerAgreementConfig: {
        subscriptions: [{ uuid: 'sub-uuid' }],
      },
    }));

    await waitForNextUpdate();

    const {
      canEnrollWithEnterpriseOffers,
      isLoading,
    } = result.current;

    expect(isLoading).toEqual(false);

    expect(canEnrollWithEnterpriseOffers).toEqual(false);
    expect(isLoading).toEqual(false);
  });
});
