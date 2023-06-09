import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function getLearnerSkillQuiz(username) {
  const config = getConfig();
  const discoveryUrl = config.DISCOVERY_API_BASE_URL;
  const taxonomyAPIUrl = 'taxonomy/api/v1/skills-quiz';
  const query = `?page_size=10&ordering=-created&username=${username}`;
  const url = `${discoveryUrl}/${taxonomyAPIUrl}/${query}`;
  return getAuthenticatedHttpClient().get(url);
}

export function getLearnerSkillLevels(jobId) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/user/v1/skill_level/${jobId}/`;
  return getAuthenticatedHttpClient().get(url);
}
