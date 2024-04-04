import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

export async function fetchPathwayProgressDetails(pathwayUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/${pathwayUUID}/`;
  try {
    const response = getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return null;
  }
}
