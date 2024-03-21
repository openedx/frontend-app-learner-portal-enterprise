import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export async function fetchLearnerProgramProgressDetail(programUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/dashboard/v0/programs/${programUUID}/progress_details/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}
