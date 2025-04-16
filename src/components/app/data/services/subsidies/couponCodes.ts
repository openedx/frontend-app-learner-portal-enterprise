import { getConfig } from '@edx/frontend-platform';

import { fetchPaginatedData } from '../utils';
import { hasValidStartExpirationDates } from '../../../../../utils/common';
import { findCouponCodeRedemptionCount } from '../../../../enterprise-user-subsidy/coupons';

// Coupon Codes

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchCouponCodeAssignments(enterpriseId: string, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_uuid: enterpriseId,
    full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
    is_active: 'True',
    ...options,
  });
  const url = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  const { results } = await fetchPaginatedData<CouponCodeAssignmentRaw>(url);
  const transformedResults = results.map((couponCode) => ({
    ...couponCode,
    available: hasValidStartExpirationDates({
      startDate: couponCode.couponStartDate,
      endDate: couponCode.couponEndDate,
    }),
  }));
  return transformedResults;
}

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchCouponsOverview(enterpriseId: string, options = {}) {
  const queryParams = new URLSearchParams({
    page: '1',
    page_size: '100',
    ...options,
  });
  const url = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  const { results } = await fetchPaginatedData<CouponOverviewRaw>(url);
  return results;
}

/**
 * TODO
 * @returns
 */
export async function fetchCouponCodes(enterpriseUuid): Promise<CouponCodes> {
  const results = await Promise.all([
    fetchCouponsOverview(enterpriseUuid),
    fetchCouponCodeAssignments(enterpriseUuid),
  ]);
  const couponCodeRedemptionCount = findCouponCodeRedemptionCount(results[1]);
  return {
    couponsOverview: results[0],
    couponCodeAssignments: results[1],
    couponCodeRedemptionCount,
  };
}
