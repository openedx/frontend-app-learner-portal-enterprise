import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchSubscriptionLicensesForUser(enterpriseUuid) {
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?enterprise_customer_uuid=${enterpriseUuid}`;
  return getAuthenticatedHttpClient().get(url);
}
