import moment from 'moment';
import { renderHook } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { useEnterpriseOffers } from '../hooks';
import * as couponService from '../../../coupons/data/service';
import * as enterpriseOffersService from '../service';
import * as config from '../../../../../config';
import { transformEnterpriseOffer } from '../utils';

jest.mock('../../../coupons/data/service');
jest.mock('../service');

const mockEnterpriseUUID = 'enterprise-uuid';
const defaultProps = {
  enterpriseId: mockEnterpriseUUID,
  enableLearnerPortalOffers: true,
  customerAgreementConfig: undefined,
  isLoadingCustomerAgreementConfig: false,
};
const mockEnterpriseOffers = [{
  discount_value: 100,
  end_datetime: '2023-01-06T00:00:00Z',
  enterprise_catalog_uuid: 'uuid',
  id: 1,
  max_discount: 200,
  remaining_balance: 200,
  start_datetime: '2022-06-09T00:00:00Z',
  usage_type: 'Percentage',
}];

describe('useEnterpriseOffers', () => {
  beforeEach(() => {
    config.features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = true;
  });
  afterEach(() => jest.clearAllMocks());

  it('fetches and sets enterprise offers', async () => {
    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockEnterpriseOffers,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(enterpriseOffersService.fetchEnterpriseOffers).toHaveBeenCalled();
    expect(result.current.enterpriseOffers).toEqual(
      camelCaseObject(mockEnterpriseOffers).map(offer => transformEnterpriseOffer(offer)),
    );
  });

  it.each([{
    featureFlagToggled: true,
    featureEnabledForEnterprise: false,
  }, {
    featureFlagToggled: false,
    featureEnabledForEnterprise: true,
  }])(
    'does not fetch enterprise offers or coupons if FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false or enableLearnerPortalOffers = false',
    async (
      {
        featureFlagToggled,
        featureEnabledForEnterprise,
      },
    ) => {
      config.features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = featureFlagToggled;

      renderHook(() => useEnterpriseOffers({
        ...defaultProps,
        enableLearnerPortalOffers: featureEnabledForEnterprise,
      }));

      expect(couponService.fetchCouponsOverview).not.toHaveBeenCalled();
      expect(enterpriseOffersService.fetchEnterpriseOffers).not.toHaveBeenCalled();
    },
  );

  it('returns canEnrollWithEnterpriseOffers = false if the enterprise has coupons', async () => {
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

  it('returns canEnrollWithEnterpriseOffers = false if the enterprise has an active sub', async () => {
    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers({
      ...defaultProps,
      customerAgreementConfig: {
        subscriptions: [{
          uuid: 'sub-uuid',
          startDate: moment().subtract(1, 'd').toISOString(),
          expirationDate: moment().add(1, 'd').toISOString(),
        }],
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

  it('returns canEnrollWithEnterpriseOffers = false if the enterprise has no active coupons or sub, but has > 1 active enterprise offer', async () => {
    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [mockEnterpriseOffers[0], { id: 2, ...mockEnterpriseOffers[1] }],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(result.current.canEnrollWithEnterpriseOffers).toEqual(false);
  });

  it('returns canEnrollWithEnterpriseOffers = true if the enterprise has no active coupons or sub, and has 1 active enterprise offer', async () => {
    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: mockEnterpriseOffers,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(result.current.canEnrollWithEnterpriseOffers).toEqual(true);
  });

  it('returns hasLowEnterpriseOffersBalance = true if the enterprise offer has remainingBalance <= 10%', async () => {
    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [
          {
            ...mockEnterpriseOffers[0],
            remaining_balance: 100,
            max_discount: 1000,
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(result.current.hasLowEnterpriseOffersBalance).toEqual(true);
    expect(result.current.hasNoEnterpriseOffersBalance).toEqual(false);
  });

  it('returns hasNoEnterpriseOffersBalance = true if the enterprise offer has remainingBalance <= 99', async () => {
    couponService.fetchCouponsOverview.mockResolvedValueOnce({
      data: {
        results: [],
      },
    });

    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [
          {
            ...mockEnterpriseOffers[0],
            remaining_balance: 99,
            max_discount: 1000,
          },
        ],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(result.current.hasLowEnterpriseOffersBalance).toEqual(true);
    expect(result.current.hasNoEnterpriseOffersBalance).toEqual(true);
  });
});
