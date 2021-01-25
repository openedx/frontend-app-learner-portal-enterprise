import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

const fetchOffers = (queryOptions) => {
  const query = qs.stringify(queryOptions);
  const config = getConfig();
  const offersUrl = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${query}`;
  return getAuthenticatedHttpClient().get(offersUrl);
};

export { fetchOffers };
