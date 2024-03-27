import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';

import { getErrorResponseStatusCode } from '../../../../utils/common';
import { fetchPaginatedData } from './utils';

// Skills

/**
 *
 * @param {*} jobId
 * @returns
 */
export async function fetchLearnerSkillLevels(jobId) {
  const url = `${getConfig().LMS_BASE_URL}/api/user/v1/skill_level/${jobId}/`;
  const response = await getAuthenticatedHttpClient().get(url);
  // Note: this API is *not* called within a route loader; it does not need a try/catch.
  return camelCaseObject(response.data);
}

// Notices

/**
 * TODO
 * @returns
 */
export const fetchNotices = async () => {
  const url = `${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const { results } = camelCaseObject(response.data);
    if (results.length === 0 || !results[0]) {
      return null;
    }
    return `${results[0]}?next=${window.location.href}`;
  } catch (error) {
    // we will just swallow error, as that probably means the notices app is not installed.
    // Notices are not necessary for the rest of dashboard to function.
    const httpErrorStatus = getErrorResponseStatusCode(error);
    if (httpErrorStatus === 404) {
      logInfo(`${error}. This probably happened because the notices plugin is not installed on platform.`);
    } else {
      logError(error);
    }
    return null;
  }
};

// User Entitlements

/**
 * TODO
 * @returns
 */
export async function fetchUserEntitlements() {
  const url = `${getConfig().LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  const { results } = await fetchPaginatedData(url);
  return results;
}
