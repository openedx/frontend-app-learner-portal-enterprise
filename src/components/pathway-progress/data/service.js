import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getPathwayProgressDetails(pathwayUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/${pathwayUUID}/`;
  return getAuthenticatedHttpClient().get(url);
}
