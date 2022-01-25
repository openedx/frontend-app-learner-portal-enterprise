import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

const fetchOffers = (options) => {
  const queryParams = new URLSearchParams(options);
  const config = getConfig();
  const offersUrl = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(offersUrl);
};

export { fetchOffers };
