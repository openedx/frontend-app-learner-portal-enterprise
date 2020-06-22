import { getAuthenticatedUser, getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

// eslint-disable-next-line import/prefer-default-export
export function fetchSubscriptionLicensesForUser(subscriptionUuid) {
  const user = getAuthenticatedUser();
  const { email } = user;
  const queryParams = { search: email };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/subscriptions/${subscriptionUuid}/licenses/?${qs.stringify(queryParams)}`;

  return getAuthenticatedHttpClient().get(url);
}
