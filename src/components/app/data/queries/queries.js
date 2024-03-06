import { getAvailableCourseRuns } from '../../../course/data/utils';
import queries from './queryKeyFactory';

/**
 * Helper function to assist querying with useQuery package
 * queries.user.entitlements
 * @returns
 */
export function queryUserEntitlements() {
  return queries.user.entitlements;
}

/**
 * Helper function to assist querying with useQuery package
 *
 * @property {[string]} QueryObject.queryKey - The query key for the object
 * @property {func} QueryObject.queryFn - The asynchronous API request "fetchNotices"
 * @returns {Types.QueryObject} - The query object for notices.
 */
export function queryNotices() {
  return queries.user.notices;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseLearner(username, enterpriseSlug)
 * @returns {Types.QueryObject}
 */
export function queryEnterpriseLearner(username, enterpriseSlug) {
  return queries.enterprise.enterpriseLearner(username, enterpriseSlug);
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.enrollments
 * @returns
 */
export function queryEnterpriseCourseEnrollments(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.enrollments;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.contentMetadata(courseKey)
 * @returns
 */
export function queryCourseMetadata(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.contentMetadata(courseKey);
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.contentHighlights
 * ._ctx.configuration
 * @returns
 */
export function queryContentHighlightsConfiguration(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.configuration;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.canRedeem(availableCourseRunKeys)
 * @returns
 */
export function queryCanRedeem(enterpriseUuid, courseMetadata) {
  const availableCourseRunKeys = getAvailableCourseRuns(courseMetadata).map(courseRun => courseRun.key);
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.canRedeem(availableCourseRunKeys);
}
