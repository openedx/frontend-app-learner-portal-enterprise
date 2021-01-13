import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchEnterpriseCustomerConfig(slug) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: config.USE_API_CACHE,
  });
  return httpClient.get(url);
}

export function fetchEnterpriseCustomerSubscriptionPlan(enterpriseUuid) {
  const queryParams = {
    enterprise_customer_uuid: enterpriseUuid,
  };
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-subscriptions/?${qs.stringify(queryParams)}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: config.USE_API_CACHE,
  });
  return httpClient.get(url);
}
