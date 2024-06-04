import queries from './queryKeyFactory';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';
import { getAvailableCourseRuns } from '../utils';

/**
 * Helper function to assist querying with React Query package
 *
 * queries.user.entitlements
 * @returns {Types.QueryOptions}
 */
export function queryUserEntitlements() {
  return queries.user.entitlements;
}

/**
 * Helper function to assist querying with React Query package
 *
 * @param {*} enterpriseUuid
 * @param {*} userEmail
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseGroupMemberships(enterpriseUuid, learnerEmail) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.enterpriseGroupMemberships(learnerEmail);
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries.user.notices
 * @returns {Types.QueryOptions}
 */
export function queryNotices() {
  return queries.user.notices;
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries.user.skillLevels(jobId)
 * @param {*} jobId
 * @returns {Types.QueryOptions}
 */
export function queryLearnerSkillLevels(jobId) {
  return queries.user.skillLevels(jobId);
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries.enterprise.enterpriseLearner(username, enterpriseSlug)
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseLearner(username, enterpriseSlug) {
  return queries.enterprise.enterpriseLearner(username, enterpriseSlug);
}

/**
 * Helper function to assist querying with React Query package
 *
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
 * Helper function to assist querying with React Query package
 *
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
 * Helper function to assist querying with React Query package
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
 * Helper function to assist querying with React Query package
 *
 * queries
 * .content
 * .course(courseKey, courseRunKey)
 * @returns {Types.QueryOptions}
 */
export function queryCourseMetadata(courseKey, courseRunKey) {
  return queries
    .content
    .course(courseKey)
    ._ctx.metadata(courseRunKey);
}

/**
 * Helper function to assist with generating the query.
 * @param {string} courseKey
 * @returns {Types.QueryOptions}
 */
export function queryCourseReviews(courseKey) {
  return queries
    .content
    .course(courseKey)
    ._ctx.reviews;
}

/**
 * Helper function to assist querying with React Query package.
 *
 * @param {*} enterpriseUuid
 * @param {*} courseKey
 * @param {*} searchCatalogs
 * @returns {Types.QueryOptions}
 */
export function queryCourseRecommendations(enterpriseUuid, courseKey, searchCatalogs) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.recommendations(searchCatalogs);
}

/**
 * Helper function to assist querying the content key catalog inclusion.
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.containsContent(contentIdentifiers)
 * @param {string} enterpriseUuid
 * @param {string} contentIdentifiers
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseCustomerContainsContent(enterpriseUuid, contentIdentifiers) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.containsContent(contentIdentifiers);
}

/**
 * Helper function to assist querying with React Query package
 *
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
 * Helper function to assist querying with React Query package
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * .academy
 * ._ctx.detail(academyUUID)
 * @returns {Types.QueryOptions}
 */
export function queryAcademiesDetail(academyUUID, enterpriseUUID) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUUID)
    ._ctx.academy
    ._ctx.detail(academyUUID);
}

/**
 * Helper function to assist querying with React Query package
 *
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
 * Helper function to assist querying with React Query package
 *
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

export function queryCanRedeemContextQueryKey(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.canRedeem._def;
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.course
 * ._ctx.canRedeem(availableCourseRunKeys)
 * @returns {Types.QueryOptions}
 */
export function queryCanRedeem(enterpriseUuid, courseMetadata, isEnrollableBufferDays) {
  const availableCourseRuns = getAvailableCourseRuns({
    course: courseMetadata,
    isEnrollableBufferDays,
  });
  const availableCourseRunKeys = availableCourseRuns.map(({ key }) => key);
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseMetadata.key)
    ._ctx.canRedeem(availableCourseRunKeys);
}

/**
 * Helper function to assist querying with React Query package
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
 * Helper function to assist querying with React Query package
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
 * Helper function to assist querying with React Query package.
 * @param {string} enterpriseUuid
 * @param {Object} transaction
 * @returns {Types.QueryOptions}
 */
export function queryPolicyTransaction(enterpriseUuid, transaction) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.policy
    ._ctx.transaction(transaction);
}

/**
 * Helper function to assist querying with React Query package
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
 * Helper function to assist querying with React Query package
 *
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
 * Helper function to assist querying with React Query package.
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest
 * ._ctx.configuration
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

export function queryRequestsContextQueryKey(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest._ctx.requests._def;
}

/**
 * Helper function to assist querying with React Query package
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
 * Helper function to assist querying with React Query package
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

/**
 * Helper function to assist querying with React Query package
 *
 * queries
 * .content
 * .program(programUUID)
 * ._ctx.progress
 * @param programUUID
 * @returns {Types.QueryOptions}
 */
export function queryLearnerProgramProgressData(programUUID) {
  return queries
    .content
    .program(programUUID)
    ._ctx.progress;
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.programs
 * ._ctx.detail(programUUID);
 * @param enterpriseUuid
 * @param programUUID
 * @returns {Types.QueryOptions}
 */
export function queryEnterpriseProgram(enterpriseUuid, programUUID) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.programs
    ._ctx.detail(programUUID);
}

/**
 * Helper function to assist querying with React Query package
 *
 * queries
 * .content
 * .pathway(pathwayUUID)
 * ._ctx.progress
 * @param programUUID
 * @returns {Types.QueryOptions}
 */
export function queryLearnerPathwayProgressData(pathwayUUID) {
  return queries
    .content
    .pathway(pathwayUUID)
    ._ctx.progress;
}
