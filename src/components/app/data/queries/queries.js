import { getAvailableCourseRuns } from '../../../course/data/utils';
import queries from './queryKeyFactory';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

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

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.subscriptions
 * @returns
 */
export function querySubscriptions(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.subscriptions;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.policy
 * ._ctx.redeemablePolicies(lmsUserId)
 * @returns
 */
export function queryRedeemablePolicies({ enterpriseUuid, lmsUserId }) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.policy
    ._ctx.redeemablePolicies(lmsUserId);
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.enterpriseOffers
 * @returns
 */
export function queryEnterpriseLearnerOffers(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.enterpriseOffers;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.couponCodes
 * @returns
 */
export function queryCouponCodes(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.couponCodes;
}

/**
 * Helper function to assist querying with useQuery package.
 *
 * @param {string} enterpriseUuid - The UUID of the enterprise.
 * @param {string} userEmail - The email of the user.
 * @returns {QueryObject} - The query object for the enterprise configuration.
 * @property {[string]} QueryObject.queryKey - The query key for the object
 * @property {func} QueryObject.queryFn - The asynchronous API request "fetchBrowseAndRequestConfiguration"
 */
export function queryBrowseAndRequestConfiguration(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.configuration;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest(userEmail)
 * ._ctx.requests(state)
 * ._ctx.licenseRequests
 * @returns
 */
export function queryLicenseRequests(enterpriseUuid, userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.requests(userEmail, state)
    ._ctx.licenseRequests;
}

/**
 * Helper function to assist querying with useQuery package
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest(userEmail)
 * ._ctx.requests(state)
 * ._ctx.couponCodeRequests
 * @returns
 */
export function queryCouponCodeRequests(enterpriseUuid, userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.requests(userEmail, state)
    ._ctx.couponCodeRequests;
}
