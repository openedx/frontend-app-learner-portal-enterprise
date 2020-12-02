import qs from 'query-string';
import { getAuthenticatedUser, getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchSubscriptionLicensesForUser(subscriptionUuid) {
  const config = getConfig();
  const user = getAuthenticatedUser();
  const { email } = user;
  const queryParams = { search: email };
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/subscriptions/${subscriptionUuid}/license/?${qs.stringify(queryParams)}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: config.USE_API_CACHE,
  });
  return httpClient.get(url);
}
