import { getAuthenticatedUser, getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

import { configuration } from '../../../config';

export function fetchSubscriptionLicensesForUser(subscriptionUuid) {
  const user = getAuthenticatedUser();
  const { email } = user;
  const queryParams = { search: email };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/subscriptions/${subscriptionUuid}/license/?${qs.stringify(queryParams)}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: configuration.USE_API_CACHE,
  });
  return httpClient.get(url);
}
