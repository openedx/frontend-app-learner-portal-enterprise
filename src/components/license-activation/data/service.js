import Cookies from 'universal-cookie';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

export async function activateLicense(activationKey) {
  // If the user has not refreshed their JWT since they created their account,
  // we should refresh it so that they'll have appropriate roles (if available),
  // and thus, have any appropriate permissions when making downstream requests.
  const loginRefreshUrl = `${process.env.LMS_BASE_URL}/login_refresh`;

  try {
    await getAuthenticatedHttpClient().post(loginRefreshUrl);
  } catch (error) {
    const isUserUnauthenticated = error.response?.status === 401;
    if (isUserUnauthenticated) {
      // Clean up the cookie if it exists to eliminate any situation
      // where the cookie is not expired but the jwt is expired.
      const cookies = new Cookies();
      cookies.remove(process.env.ACCESS_TOKEN_COOKIE_NAME);
    }
  }

  const queryParams = { activation_key: activationKey };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/license-activation/?${qs.stringify(queryParams)}`;

  return getAuthenticatedHttpClient().post(url);
}
