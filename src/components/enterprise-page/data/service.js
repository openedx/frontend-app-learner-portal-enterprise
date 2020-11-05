import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

import { configuration } from '../../../config';

export function fetchEnterpriseCustomerConfig(slug) {
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: configuration.USE_API_CACHE,
  });
  return httpClient.get(url);
}

export function fetchEnterpriseCustomerSubscriptionPlan(enterpriseUuid) {
  const queryParams = {
    enterprise_customer_uuid: enterpriseUuid,
  };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/learner-subscriptions/?${qs.stringify(queryParams)}`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: configuration.USE_API_CACHE,
  });
  return httpClient.get(url);
}
