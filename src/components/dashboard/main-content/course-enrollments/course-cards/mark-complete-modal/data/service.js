import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';

export const ENROLL_ENDPOINT = '/enterprise_learner_portal/api/v1/enterprise_course_enrollments/';

/**
 * @typedef {object} RequestOptions
 * @property {string} course_id CourseId
 * @property {string} enterprise_id EnterpriseId
 * @property {string} saved_for_later True/False. True saves a course for later.
 */

/**
 * Request to save course for later / move course to in progress.
 * @param {RequestOptions} options
 * @requires {Promise} Request promise.
 */
export const updateCourseCompleteStatusRequest = (options) => {
  const config = getConfig();
  let url = `${config.LMS_BASE_URL}${ENROLL_ENDPOINT}`;
  if (options) {
    const queryParams = new URLSearchParams(options);
    url += `?${queryParams.toString()}`;
  }
  return getAuthenticatedHttpClient().patch(url);
};

export async function getProgressTabData(courseId, targetUserId) {
  let url = `${getConfig().LMS_BASE_URL}/api/course_home/progress/${courseId}`;

  if (targetUserId) {
    url += `/${targetUserId}/`;
  }

  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    const camelCasedData = camelCaseObject(data);

    return camelCasedData;
  } catch (error) {
    throw error;
  }
}
