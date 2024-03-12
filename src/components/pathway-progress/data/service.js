import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getPathwayProgressDetails(pathwayUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/${pathwayUUID}/`;
  return getAuthenticatedHttpClient().get(url);
}

// eslint-disable-next-line no-unused-vars
export function fetchInProgressPathways(enterpriseUUID) {
  // TODO: after adding support of filtering on enterprise UUID, send the uuid to endpoint as well
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/`;
  return getAuthenticatedHttpClient().get(url);
}
