import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchEnterpriseCustomerByUUID(enterpriseUUID) {
  const config = getConfig();

  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?uuid=${enterpriseUUID}`;
  return getAuthenticatedHttpClient().get(url);
}
