import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// Coupon Codes

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchCouponCodeAssignments(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_uuid: enterpriseId,
    full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
    is_active: 'True',
    ...options,
  });
  const url = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchCouponsOverview(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchCouponCodes(enterpriseUuid) {
  const results = await Promise.all([
    fetchCouponsOverview(enterpriseUuid),
    fetchCouponCodeAssignments(enterpriseUuid),
  ]);
  return {
    couponsOverview: results[0],
    couponCodeAssignments: results[1],
  };
}
