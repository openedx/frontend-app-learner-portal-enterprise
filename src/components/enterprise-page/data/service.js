import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
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
  const url = `${config.LMS_BASE_URL}/enterprise/select/active/`;

  const formData = new FormData();
  formData.append('enterprise', enterpriseId);

  return getAuthenticatedHttpClient().post(
    url,
    formData,
  );
};

async function fetchData(url, linkedEnterprises = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const linkedEnterprisesCopy = [...linkedEnterprises];
  linkedEnterprisesCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchData(responseData.next, linkedEnterprisesCopy);
  }
  return linkedEnterprisesCopy;
}

export const fetchEnterpriseLearnerData = async (options) => {
  const config = getConfig();
  const enterpriseLearnerUrl = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    ...options,
    page: 1,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  const response = await fetchData(url);
  return response;
};
