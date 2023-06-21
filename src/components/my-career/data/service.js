import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export async function getLearnerProfileInfo(username) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/user/v1/accounts/${username}`;
  const { data } = await getAuthenticatedHttpClient().get(url)
    .catch((error) => {
      throw error;
    });
  return data;
}

export function getLearnerSkillLevels(jobId) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/user/v1/skill_level/${jobId}/`;
  return getAuthenticatedHttpClient().get(url);
}

export async function patchProfile(username, params) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/user/v1/accounts/${username}`;
  const { data } = await getAuthenticatedHttpClient()
    .patch(url, params, {
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
    })
    .catch((error) => {
      throw error;
    });
  return data;
}

export async function fetchJobDetailsFromAlgolia(searchIndex, jobName) {
  const { hits } = await searchIndex.search('', {
    facetFilters: [
      [`name:${jobName}`],
    ],
  });
  return hits[0];
}
