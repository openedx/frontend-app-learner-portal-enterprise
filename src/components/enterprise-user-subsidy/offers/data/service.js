import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { configuration } from '../../../../config';

const fetchOffers = (query) => {
  const offersUrl = `${process.env.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${query}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: configuration.USE_API_CACHE,
  });
  return httpClient.get(offersUrl);
};

export { fetchOffers };
