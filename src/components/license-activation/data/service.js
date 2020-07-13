import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

// eslint-disable-next-line import/prefer-default-export
export function activateLicense(activationKey) {
  const queryParams = { activation_key: activationKey };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/license-activation/?${qs.stringify(queryParams)}`;

  return getAuthenticatedHttpClient().post(url);
}
