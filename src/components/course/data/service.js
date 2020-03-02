import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const fetchCourseDetails = (courseKey) => {
  const url = `${process.env.DISCOVERY_API_URL}/v1/courses/${courseKey}`;
  return getAuthenticatedHttpClient().get(url);
};

// eslint-disable-next-line import/prefer-default-export
export { fetchCourseDetails };
