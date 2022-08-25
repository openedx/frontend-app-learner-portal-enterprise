import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const fetchEnterpriseCustomerConfigForSlug = (slug, useCache = true) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: useCache && config.USE_API_CACHE,
  });
  return httpClient.get(url);
};

export const updateUserActiveEnterprise = (enterpriseId) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/select/active`;

  const formData = new FormData();
  formData.append('enterprise', enterpriseId);

  return getAuthenticatedHttpClient().post(
    url,
    formData,
  );
};
