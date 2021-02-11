import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchCommunityActivityFeed = () => {
  const config = getConfig();
  // TODO: limit this to most recent 5 activities
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-activity/`;
  return getAuthenticatedHttpClient().get(url);
};
