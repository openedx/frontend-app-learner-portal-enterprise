import apiClient from '@edx/frontend-learner-portal-base/src/apiClient';

const fetchEntepriseCustomerConfig = (slug) => {
  const url = `${process.env.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/dashboard_list/?enterprise_slug=${slug}`;
  return apiClient.get(url);
};

// eslint-disable-next-line import/prefer-default-export
export { fetchEntepriseCustomerConfig };
