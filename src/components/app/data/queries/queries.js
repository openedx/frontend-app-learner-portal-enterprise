import { getAvailableCourseRuns } from '../../../course/data/utils';
import queries from './queryKeyFactory';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

/**
 * Helper function to assist querying with useQuery package
 * queries.user.entitlements
 * @returns {Types.QueryOptions}
 */
export function queryUserEntitlements() {
  return queries.user.entitlements;
}

/**
 * Helper function to assist querying with useQuery package
 *
 * @returns {Types.QueryOptions}
 */
export function queryNotices() {
  return queries.user.notices;
}

/**
 * Helper function to assist querying with useQuery package
 * @param {*} jobId
 * @returns {Types.QueryOptions}
 */
export function queryLearnerSkillLevels(jobId) {
  return queries.user.skillLevels(jobId);
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseLearner(username, enterpriseSlug)
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * ._ctx.programs
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseProgramsList(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.programs;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.pathways
 * @returns {Types.QueryOptions}
 */
export function queryEnterprisePathwaysList(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.pathways;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.contentMetadata(courseKey)
 * @returns {Types.QueryOptions}
 */
export function queryCourseMetadata(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.contentMetadata(courseKey);
}

/**
 * Helper function to assist querying the content key catalog inclusion.
 * @param {string} enterpriseUuid
 * @param {string} courseKey
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseCustomerCatalogsContainsContent(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.enterpriseCustomerCatalogsContainsContent(courseKey);
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.academies
 * ._ctx.list
 * @returns {Types.QueryOptions}
 */
export function queryAcademiesList(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.academies
    ._ctx.list;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.contentHighlights
 * ._ctx.configuration
 * @returns {Types.QueryOptions}
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
 * ._ctx.contentHighlights
 * ._ctx.highlightSets
 * @returns {Types.QueryOptions}
 */
export function queryContentHighlightSets(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.highlightSets;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.canRedeem(availableCourseRunKeys)
 * @returns {Types.QueryOptions}
 */
export function queryCanRedeem(enterpriseUuid, courseMetadata, isEnrollableBufferDays) {
  const availableCourseRunKeys = getAvailableCourseRuns({
    course: courseMetadata,
    isEnrollableBufferDays,
  }).map(courseRun => courseRun.key);
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
 * @returns {Types.QueryOptions}
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
