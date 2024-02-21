import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { getErrorResponseStatusCode } from '../../utils/common';

export const getNotices = async () => {
  const authenticatedUser = getAuthenticatedUser();
  const url = new URL(`${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`);
  if (authenticatedUser) {
    try {
      const { data } = await getAuthenticatedHttpClient().get(url.href, {});
      return data;
    } catch (error) {
      // we will just swallow error, as that probably means the notices app is not installed.
      // Notices are not necessary for the rest of dashboard to function.
      const httpErrorStatus = getErrorResponseStatusCode(error);
      if (httpErrorStatus === 404) {
        logInfo(`${error}. This probably happened because the notices plugin is not installed on platform.`);
      } else {
        logError(error);
      }
    }
  }
  return null;
};
