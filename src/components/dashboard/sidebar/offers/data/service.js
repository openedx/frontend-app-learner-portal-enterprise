import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const fetchOffers = () => {
  const offersUrl = `${process.env.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/`;
  return getAuthenticatedHttpClient().get(offersUrl);
};

// eslint-disable-next-line import/prefer-default-export
export { fetchOffers };
