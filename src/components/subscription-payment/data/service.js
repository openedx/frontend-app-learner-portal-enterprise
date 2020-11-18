import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function sendRecurlyToken(options = {}) {
  console.log('sendRecurlyToken', options);
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/subscription-payment/`;
  return getAuthenticatedHttpClient().post(url, options);
}
