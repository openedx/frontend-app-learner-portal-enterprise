import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { snakeCaseObject, camelCaseObject } from '@edx/frontend-platform/utils';

export async function checkoutExecutiveEducation2U(options = {}) {
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/executive-education-2u/checkout/`;
  const payload = {
    ...snakeCaseObject(options),
  };
  const res = await getAuthenticatedHttpClient().post(url, payload);
  const result = camelCaseObject(res.data);
  return result;
}
