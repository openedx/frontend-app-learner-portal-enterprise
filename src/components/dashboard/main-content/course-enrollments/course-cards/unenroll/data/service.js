import { snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export const unenrollFromCourse = (options) => {
  const url = `${getConfig().LMS_BASE_URL}/change_enrollment`;
  const params = new FormData();
  params.append('enrollment_action', 'unenroll');
  Object.entries(snakeCaseObject(options)).forEach(([key, value]) => {
    params.append(key, value);
  });
  return getAuthenticatedHttpClient().post(url, params);
};
