import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchEnterpriseCustomersForUser() {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/`;
  return getAuthenticatedHttpClient().get(url);
}
