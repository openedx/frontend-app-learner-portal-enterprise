import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchCouponCodeAssignments, fetchCouponCodes, fetchCouponsOverview } from '.';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const enterpriseId = 'test-enterprise-uuid';
const APP_CONFIG = {
  ECOMMERCE_BASE_URL: 'http://localhost:18130',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

function getCouponCodeAssignmentsUrl(enterpriseUuid) {
  const queryParams = new URLSearchParams({
    enterprise_uuid: enterpriseUuid,
    full_discount_only: 'True',
    is_active: 'True',
  });
  return `${APP_CONFIG.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
}

function getCouponsOverviewUrl(enterpriseUuid) {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 100,
  });
  return `${APP_CONFIG.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseUuid}/overview/?${queryParams.toString()}`;
}

describe('fetchCouponCodeAssignments', () => {
  const COUPON_CODE_ASSIGNMENTS_URL = getCouponCodeAssignmentsUrl(enterpriseId);

  it('returns coupon code assignments', async () => {
    const couponCodeAssignmentsResponse = {
      results: [{ id: 123 }],
    };
    axiosMock.onGet(COUPON_CODE_ASSIGNMENTS_URL).reply(200, couponCodeAssignmentsResponse);
    const result = await fetchCouponCodeAssignments(enterpriseId);
    const expectedCouponsOverviewResponse = [{ ...couponCodeAssignmentsResponse.results[0], available: false }];
    expect(result).toEqual(expectedCouponsOverviewResponse);
  });
});

describe('fetchCouponsOverview', () => {
  const COUPONS_OVERVIEW_URL = getCouponsOverviewUrl(enterpriseId);

  it('returns coupons overview', async () => {
    const couponsOverviewResponse = {
      results: [{ id: 123 }],
    };
    axiosMock.onGet(COUPONS_OVERVIEW_URL).reply(200, couponsOverviewResponse);
    const result = await fetchCouponsOverview(enterpriseId);
    expect(result).toEqual(couponsOverviewResponse.results);
  });
});

describe('fetchCouponCodes', () => {
  it('returns coupons related data', async () => {
    const COUPON_CODE_ASSIGNMENTS_URL = getCouponCodeAssignmentsUrl(enterpriseId);
    const COUPONS_OVERVIEW_URL = getCouponsOverviewUrl(enterpriseId);
    const couponCodeAssignmentsResponse = {
      results: [
        { code: 123, redemptionsRemaining: 1 },
        { code: 456, redemptionsRemaining: 2 },
      ],
    };
    const couponsOverviewResponse = {
      results: [{ id: 123 }],
    };
    axiosMock.onGet(COUPON_CODE_ASSIGNMENTS_URL).reply(200, couponCodeAssignmentsResponse);
    axiosMock.onGet(COUPONS_OVERVIEW_URL).reply(200, couponsOverviewResponse);
    const result = await fetchCouponCodes(enterpriseId);

    const expectedCouponsCodeAssignmentsResponse = couponCodeAssignmentsResponse.results.map((assignment) => ({
      ...assignment,
      available: false,
    }));
    expect(result).toEqual({
      couponCodeAssignments: expectedCouponsCodeAssignmentsResponse,
      couponsOverview: couponsOverviewResponse.results,
      couponCodeRedemptionCount: 3,
    });
  });
});
