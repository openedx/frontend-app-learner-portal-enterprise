import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { loginRefresh } from '../../../utils/common';

export async function activateLicense(activationKey) {
  const config = getConfig();

  // If the user has not refreshed their JWT since they created their account,
  // we should refresh it so that they'll have appropriate roles (if available),
  // and thus, have any appropriate permissions when making downstream requests.
  loginRefresh();

  const queryParams = { activation_key: activationKey };
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/license-activation/?${qs.stringify(queryParams)}`;

  return getAuthenticatedHttpClient().post(url);
}
