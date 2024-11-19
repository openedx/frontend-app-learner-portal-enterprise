import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export async function fetchEnterpriseLearnerDashboard(enterpriseId, enterpriseSlug, lmsUserId) {
  const { ENTERPRISE_ACCESS_BASE_URL } = getConfig();
  const params = {
    enterprise_customer_uuid: enterpriseId,
    enterprise_customer_slug: enterpriseSlug,
    lms_user_id: lmsUserId,
  };
  const url = `${ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/learner/dashboard/`;
  try {
    const result = await getAuthenticatedHttpClient().post(url, params);
    return camelCaseObject(result.data);
  } catch (error) {
    logError(error);
    // TODO: consider returning a sane default API response structure here to mitigate complete failure.
    return {};
  }
}
