import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';

export function fetchSkillsId(skills) {
  const queryParams = new URLSearchParams({
    name: skills,
  });
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function postSkillsGoalsAndJobsUserSelected(goal, skillsId, interestedJobsId, currentJobRoleId) {
  const options = {
    goal,
    current_job: currentJobRoleId ? currentJobRoleId[0] : null,
    skills: skillsId,
    future_jobs: interestedJobsId || [],
  };
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
  getAuthenticatedHttpClient().post(url, options).catch((error) => {
    logError(new Error(error));
  });
}
