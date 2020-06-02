import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// eslint-disable-next-line import/prefer-default-export
export function fetchEnterpriseCustomerConfig(slug) {
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  return getAuthenticatedHttpClient().get(url);
}
