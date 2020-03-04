import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchCourseDetails = (courseKey) => {
  const url = `${process.env.DISCOVERY_API_URL}/v1/courses/${courseKey}`;
  return getAuthenticatedHttpClient().get(url);
};

export const fetchUserEnrollments = () => {
  const url = `${process.env.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().get(url);
};

export const fetchUserEntitlements = () => {
  const url = `${process.env.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  return getAuthenticatedHttpClient().get(url);
};

export const enrollUser = (data) => {
  const url = `${process.env.LMS_BASE_URL}/api/commerce/v0/baskets/`;
  return getAuthenticatedHttpClient().post(url, data);
};
