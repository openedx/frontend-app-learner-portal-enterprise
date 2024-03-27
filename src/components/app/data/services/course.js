import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { getErrorResponseStatusCode } from '../../../../utils/common';
import { getActiveCourseRun, getAvailableCourseRuns } from '../utils';

/**
 * TODO
 * @param {string} enterpriseId
 * @param {string} courseKey
 * @param {string} [courseRunKey]
 * @param {object} [options]
 * @returns
 */
export async function fetchCourseMetadata(enterpriseId, courseKey, courseRunKey, isEnrollableBufferDays, options = {}) {
  const contentMetadataUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/content-metadata/${courseKey}/`;
  const queryParams = new URLSearchParams({
    ...options,
  });
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const transformedData = camelCaseObject(response.data);

    // Determine the `activeCourseRun` (advertised course run) for the course. This must
    // happen *before* filtering the course runs for the specified course run key. The
    // returned `activeCourseRun` is used for display regardless of the course run key (e.g.,
    // for some of the course sidebar items).
    transformedData.activeCourseRun = getActiveCourseRun(transformedData);

    const courseRunKeys = transformedData.courseRuns.map(({ key }) => key);
    if (courseRunKey && courseRunKeys.includes(courseRunKey)) {
      transformedData.canonicalCourseRunKey = courseRunKey;
      transformedData.courseRunKeys = [courseRunKey];
      transformedData.courseRuns = transformedData.courseRuns.filter(
        courseRun => courseRun.key === courseRunKey,
      );
    }
    transformedData.availableCourseRuns = getAvailableCourseRuns({
      course: transformedData,
      isEnrollableBufferDays,
    });
    return transformedData;
  } catch (error) {
    if (getErrorResponseStatusCode(error) !== 404) {
      logError(error);
    }
    return null;
  }
}

/**
 * Service method to determine whether the authenticated user can redeem the specified course run(s).
 *
 * @param {object} args
 * @param {array} courseRunKeys List of course run keys.
 * @returns Promise for get request from the authenticated http client.
 */
export async function fetchCanRedeem(enterpriseId, courseRunKeys) {
  // Handles an edge case where if a course has no available course
  // runs, the API call should not be made.
  if (courseRunKeys.length === 0) {
    return [];
  }
  const queryParams = new URLSearchParams();
  courseRunKeys.forEach((courseRunKey) => {
    queryParams.append('content_key', courseRunKey);
  });
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${enterpriseId}/can-redeem/`;
  const urlWithParams = `${url}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(urlWithParams);
    return camelCaseObject(response.data);
  } catch (error) {
    if (getErrorResponseStatusCode(error) !== 404) {
      logError(error);
    }
    return [];
  }
}

export async function fetchCourseReviews(courseKey) {
  const url = `${getConfig().DISCOVERY_API_BASE_URL}/api/v1/course_review/${courseKey}/`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return null;
  }
}
