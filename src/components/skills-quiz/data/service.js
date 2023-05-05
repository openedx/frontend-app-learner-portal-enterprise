import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

export function postSkillsGoalsAndJobsUserSelected(goal, interestedJobsId, currentJobRoleId) {
  const options = {
    goal,
    current_job: currentJobRoleId ? currentJobRoleId[0] : null,
    future_jobs: interestedJobsId || [],
  };
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
  getAuthenticatedHttpClient().post(url, options).catch((error) => {
    logError(new Error(error));
  });
}

export function fetchCourseEnrollments() {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().get(url);
}
