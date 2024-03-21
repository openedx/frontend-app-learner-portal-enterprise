import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig, camelCaseObject } from '@edx/frontend-platform';

export function fetchLearnerSkillLevels(jobId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user/v1/skill_level/${jobId}/`;
  return getAuthenticatedHttpClient().get(url);
}

export async function patchProfile(username, params) {
  const url = `${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}`;
  const response = await getAuthenticatedHttpClient().patch(url, params, {
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
  });
  return camelCaseObject(response.data);
}

export async function fetchJobDetailsFromAlgolia(searchIndex, jobName) {
  const { hits } = await searchIndex.search('', {
    facetFilters: [
      [`name:${jobName}`],
    ],
  });
  return hits[0];
}
