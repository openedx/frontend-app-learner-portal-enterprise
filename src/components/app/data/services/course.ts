import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { findHighestLevelEntitlementSku, getActiveCourseRun } from '../utils';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../../../constants';

/**
 * Service method to fetch course metadata for a given course key.
 * @param {string} enterpriseId
 * @param {string} courseKey
 * @returns
 */
export async function fetchCourseMetadata(courseKey): Promise<CourseMetadata> {
  const contentMetadataUrl = `${getConfig().DISCOVERY_API_BASE_URL}/api/v1/courses/${courseKey}/`;
  const queryParams = new URLSearchParams();
  // Always include restricted/custom-b2b-enterprise runs in case one has been requested.
  queryParams.append('include_restricted', ENTERPRISE_RESTRICTION_TYPE);
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  const transformedData = camelCaseObject(response.data);

  // Determine the `activeCourseRun` (advertised course run) for the course. This must
  // happen *before* filtering the course runs for the specified course run key. The
  // returned `activeCourseRun` is used for display regardless of the course run key (e.g.,
  // for some of the course sidebar items).
  transformedData.activeCourseRun = getActiveCourseRun(transformedData);
  transformedData.courseEntitlementProductSku = findHighestLevelEntitlementSku(transformedData.entitlements);

  return transformedData;
}

export async function fetchCourseRunMetadata(courseRunKey) {
  const courseRunMetadataUrl = `${getConfig().DISCOVERY_API_BASE_URL}/api/v1/course_runs/${courseRunKey}/`;
  const queryParams = new URLSearchParams();
  // Always include restricted/custom-b2b-enterprise runs in case one has been requested.
  queryParams.append('include_restricted', ENTERPRISE_RESTRICTION_TYPE);
  const url = `${courseRunMetadataUrl}?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
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
  const response = await getAuthenticatedHttpClient().get(urlWithParams);
  return camelCaseObject(response.data);
}

export async function fetchCanRequest(enterpriseId, courseKey) {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${enterpriseId}/can-request/`;
  const queryParams = new URLSearchParams();
  queryParams.append('content_key', courseKey);
  const urlWithParams = `${url}?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(urlWithParams);
  return camelCaseObject(response.data);
}

export async function fetchCourseReviews(courseKey) {
  const url = `${getConfig().DISCOVERY_API_BASE_URL}/api/v1/course_review/${courseKey}/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

export async function fetchCourseRecommendations(enterpriseUuid, courseKey, searchCatalogs) {
  const courseRecommendationsUrl = `${getConfig().DISCOVERY_API_BASE_URL}/taxonomy/api/v1/course_recommendations/${courseKey}/`;
  const courseRecommendationsResponse = await getAuthenticatedHttpClient().get(courseRecommendationsUrl);
  const courseRecommendations = camelCaseObject(courseRecommendationsResponse.data);
  const {
    allRecommendations,
    samePartnerRecommendations,
  } = courseRecommendations;

  // handle no recommendations case
  if (allRecommendations.length < 1 && samePartnerRecommendations.length < 1) {
    return courseRecommendations;
  }

  const allRecommendationsKeys = allRecommendations.map((rec) => rec.key);
  const samePartnerRecommendationsKeys = samePartnerRecommendations.map((rec) => rec.key);

  const options = {
    content_keys: allRecommendationsKeys.concat(samePartnerRecommendationsKeys),
    catalog_uuids: searchCatalogs,
  };
  const filteredContentItemsUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseUuid}/filter_content_items/`;
  const filteredContentResponse = await getAuthenticatedHttpClient().post(filteredContentItemsUrl, options);
  const { filteredContentKeys } = camelCaseObject(filteredContentResponse.data);

  const filteredCourseRecommendations = {
    allRecommendations: allRecommendations.filter(
      (rec) => !samePartnerRecommendationsKeys.includes(rec.key) && filteredContentKeys.includes(rec.key),
    ),
    samePartnerRecommendations: samePartnerRecommendations.filter(
      (rec) => filteredContentKeys.includes(rec.key),
    ),
  };
  return filteredCourseRecommendations;
}
