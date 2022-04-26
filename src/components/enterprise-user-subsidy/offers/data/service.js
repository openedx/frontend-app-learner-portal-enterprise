import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

const fetchOffers = (options) => {
  const queryParams = new URLSearchParams(options);
  const config = getConfig();
  const offersUrl = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(offersUrl);
};

const fetchCouponsOverview = ({ enterpriseId, options = {} }) => {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 50,
    filter: 'active',
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
};

export { fetchOffers, fetchCouponsOverview };
