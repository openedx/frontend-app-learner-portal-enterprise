import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

const fetchCouponCodeAssignments = (options) => {
  const queryParams = new URLSearchParams(options);
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

const fetchCouponsOverview = ({ enterpriseId, options = {} }) => {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

export { fetchCouponCodeAssignments, fetchCouponsOverview };
