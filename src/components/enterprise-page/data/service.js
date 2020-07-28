import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import qs from 'query-string';

export function fetchEnterpriseCustomerConfig(slug) {
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchEnterpriseCustomerSubscriptionPlan(enterpriseUuid) {
  const queryParams = {
    enterprise_customer_uuid: enterpriseUuid,
    // TODO: provide `is_active=true` query param to only return subscription plans that
    // are active to avoid needing to iterate through?
    // is_active: true,
  };
  const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/learner-subscriptions/?${qs.stringify(queryParams)}`;
  return getAuthenticatedHttpClient().get(url);
}
