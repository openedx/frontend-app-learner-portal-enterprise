import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const getEnterpriseCuration = (enterpriseUUID) => {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
  });
  return getAuthenticatedHttpClient().get(`${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`);
};
