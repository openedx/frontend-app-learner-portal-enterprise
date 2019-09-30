import apiClient from '@edx/frontend-learner-portal-base/src/apiClient';

const fetchOffers = () => {
  const offersUrl = `${process.env.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/`;
  return apiClient.get(offersUrl);
};

// eslint-disable-next-line import/prefer-default-export
export { fetchOffers };
