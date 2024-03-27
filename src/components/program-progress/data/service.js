import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getLearnerProgramProgressDetail(programUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/dashboard/v0/programs/${programUUID}/progress_details/`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchLearnerProgramsList(enterpriseUuid) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/dashboard/v0/programs/${enterpriseUuid}/`;
  return getAuthenticatedHttpClient().get(url);
}
