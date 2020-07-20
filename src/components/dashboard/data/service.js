import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const fetchEntepriseCustomerConfig = (slug) => {
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?slug=${slug}`;
  return getAuthenticatedHttpClient().get(url);
};

export { fetchEntepriseCustomerConfig };
