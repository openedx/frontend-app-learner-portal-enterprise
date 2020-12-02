import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

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
    url += `?${qs.stringify(options)}`;
  }
  return getAuthenticatedHttpClient().patch(url);
};
