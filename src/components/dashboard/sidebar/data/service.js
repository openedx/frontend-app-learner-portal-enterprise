import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const fetchRecentCommunityActivityFeed = () => {
  const config = getConfig();
  // TODO: limit this to most recent 5 activities
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-activity/`;
  const httpClient = getAuthenticatedHttpClient({
    useCache: config.USE_API_CACHE,
  });
  return httpClient.get(url);
};
