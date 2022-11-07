import { renderHook } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { useEnterpriseOffers } from '../hooks';
import * as enterpriseOffersService from '../service';
import * as config from '../../../../../config';
import { transformEnterpriseOffer } from '../utils';

jest.mock('../../../coupons/data/service');
jest.mock('../service');
jest.mock('../../../data/service');

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
  afterEach(() => jest.resetAllMocks());
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
    'does not fetch enterprise offers if FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = false or enableLearnerPortalOffers = false',
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

      expect(enterpriseOffersService.fetchEnterpriseOffers).not.toHaveBeenCalled();
    },
  );

  it('returns canEnrollWithEnterpriseOffers = true if the enterprise has > 1 active enterprise offer', async () => {
    enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
      data: {
        results: [mockEnterpriseOffers[0], { id: 2, ...mockEnterpriseOffers[1] }],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

    await waitForNextUpdate();

    expect(result.current.canEnrollWithEnterpriseOffers).toEqual(true);
  });

  it.each([
    {
      offerResults: [{
        ...mockEnterpriseOffers[0],
        remaining_balance: 50,
        max_discount: 1000,
      }, {
        ...mockEnterpriseOffers[0],
        remaining_balance: 500,
        max_discount: 1000,
      }],
      expectedHasLowEnterpriseOffersBalance: true,
    },
    {
      offerResults: [{
        ...mockEnterpriseOffers[0],
        remaining_balance: 150,
        max_discount: 1000,
      }, {
        ...mockEnterpriseOffers[0],
        remaining_balance: 500,
        max_discount: 1000,
      }],
      expectedHasLowEnterpriseOffersBalance: false,
    },
  ])(
    'determines low balance when any enterprise offer has remainingBalance <= 10%',
    async ({ offerResults, expectedHasLowEnterpriseOffersBalance }) => {
      enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
        data: {
          results: offerResults,
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

      await waitForNextUpdate();

      expect(result.current.hasLowEnterpriseOffersBalance).toEqual(expectedHasLowEnterpriseOffersBalance);
    },
  );

  it.each([
    {
      offerResults: [{
        ...mockEnterpriseOffers[0],
        remaining_balance: 50,
        max_discount: 1000,
      }, {
        ...mockEnterpriseOffers[0],
        remaining_balance: 80,
        max_discount: 1000,
      }],
      expectedHasNoEnterpriseOffersBalance: true,
    },
    {
      offerResults: [{
        ...mockEnterpriseOffers[0],
        remaining_balance: 100,
        max_discount: 1000,
      }, {
        ...mockEnterpriseOffers[0],
        remaining_balance: 25,
        max_discount: 1000,
      }],
      expectedHasNoEnterpriseOffersBalance: false,
    },
  ])(
    'determines no balance when all enterprise offers have remainingBalance <= 99',
    async ({
      offerResults, expectedHasNoEnterpriseOffersBalance,
    }) => {
      enterpriseOffersService.fetchEnterpriseOffers.mockResolvedValueOnce({
        data: {
          results: offerResults,
        },
      });

      const { result, waitForNextUpdate } = renderHook(() => useEnterpriseOffers(defaultProps));

      await waitForNextUpdate();

      expect(result.current.hasNoEnterpriseOffersBalance).toEqual(expectedHasNoEnterpriseOffersBalance);
    },
  );
});
