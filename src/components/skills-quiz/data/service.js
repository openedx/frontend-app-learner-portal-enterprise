import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export async function postSkillsGoalsAndJobsUserSelected(goal, interestedJobsId, currentJobRoleId) {
  const options = {
    goal,
    current_job: currentJobRoleId ? currentJobRoleId[0] : null,
    future_jobs: interestedJobsId || [],
  };
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
  return getAuthenticatedHttpClient().post(url, options);
}

export function fetchCourseEnrollments() {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().get(url);
}

export async function fetchJobPathDescription(currentJobID, futureJobID) {
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/job-path/?current_job=${currentJobID}&future_job=${futureJobID}`;
  const result = await getAuthenticatedHttpClient().get(url);
  return result.data.description;
}
