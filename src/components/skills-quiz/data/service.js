import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

export async function postSkillsGoalsAndJobsUserSelected(goal, interestedJobsId, currentJobRoleId) {
  const options = {
    goal,
    current_job: currentJobRoleId ? currentJobRoleId[0] : null,
    future_jobs: interestedJobsId || [],
  };
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
  return getAuthenticatedHttpClient().post(url, options).catch((error) => {
    logError(new Error(error));
  });
}

export function fetchCourseEnrollments() {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().get(url);
}

export async function fetchJobPathDescription(currentJobID, futureJobID) {
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/job-path/?current_job=${currentJobID}&future_job=${futureJobID}`;
  const result = await getAuthenticatedHttpClient({ useCache: config.USE_API_CACHE }).get(url);
  return result.data.description;
}
