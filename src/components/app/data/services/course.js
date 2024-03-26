import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { getErrorResponseStatusCode } from '../../../../utils/common';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchCourseMetadata(enterpriseId, courseKey, options = {}) {
  const contentMetadataUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/content-metadata/${courseKey}/`;
  const queryParams = new URLSearchParams({
    ...options,
  });
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
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

// TODO: move outside of course since it may also be
// used for program content inclusion as well.
export async function fetchEnterpriseCustomerContainsContent(enterpriseId, courseKey) {
  // This API call will *only* obtain the enterprise's catalogs whose
  // catalog queries return/contain the specified courseKey.
  const queryParams = new URLSearchParams({
    course_run_ids: courseKey,
    get_catalogs_containing_specified_content_ids: true,
  });

  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/contains_content_items/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return null;
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
