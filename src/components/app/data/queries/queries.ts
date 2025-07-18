import queries from './queryKeyFactory';
import { SUBSIDY_REQUEST_STATE } from '../../../../constants';

/**
 * Helper function to assist querying with React Query package
 */
export function queryUserEntitlements() {
  return queries.user.entitlements;
}

/**
 * Helper function to assist querying with React Query package
 */
export function queryNotices() {
  return queries.user.notices;
}

/**
 * Helper function to assist querying with React Query package
 */
export function queryLearnerSkillLevels(jobId) {
  return queries.user.skillLevels(jobId);
}

/**
 * Helper function to assist querying with React Query package
 */
export function queryEnterpriseLearner(username: string, enterpriseSlug?: string) {
  return queries.enterprise.enterpriseLearner(username, enterpriseSlug);
}

export function queryEnterpriseCourseEnrollments(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.enrollments;
}

export function queryEnterpriseProgramsList(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.programs;
}

export function queryEnterprisePathwaysList(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.pathways;
}

export function queryCourseMetadata(courseKey: string) {
  return queries
    .content
    .course(courseKey)
    ._ctx.metadata;
}

export function queryCourseRunMetadata(courseRunKey) {
  return queries
    .content
    .course(null)
    ._ctx.metadata
    ._ctx.courseRun(courseRunKey);
}

export function queryCourseReviews(courseKey: string) {
  return queries
    .content
    .course(courseKey)
    ._ctx.reviews;
}

export function queryCourseRecommendations(enterpriseUuid: string, courseKey: string, searchCatalogs: string[]) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.recommendations(searchCatalogs);
}

export function queryEnterpriseCustomerContainsContent(enterpriseUuid: string, contentIdentifiers: string[]) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.containsContent(contentIdentifiers);
}

export function queryAcademiesList(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.academies
    ._ctx.list;
}

export function queryAcademiesDetail(academyUUID: string, enterpriseUUID: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUUID)
    ._ctx.academy
    ._ctx.detail(academyUUID);
}

export function queryContentHighlightsConfiguration(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.configuration;
}

export function queryContentHighlightSets(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.highlightSets;
}

export function queryCanRedeemContextQueryKey(enterpriseUuid: string, courseKey: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.canRedeem._def;
}

export function queryCanRedeem(
  enterpriseUuid: string,
  courseKey,
  courseRunKeys,
) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.canRedeem(courseRunKeys);
}

export function queryCanRequest(enterpriseUuid: string, courseKey: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(courseKey)
    ._ctx.canRequest();
}

export function queryCanUpgradeWithLearnerCredit(enterpriseUuid: string, courseRunKey: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course(null)
    ._ctx.canRedeem([courseRunKey]);
}

export function querySubscriptions(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.subscriptions;
}

export function queryRedeemablePolicies({ enterpriseUuid, lmsUserId }: { enterpriseUuid: string; lmsUserId: number }) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.policy
    ._ctx.redeemablePolicies(lmsUserId);
}

export function queryPolicyTransaction(enterpriseUuid: string, transactionStatusApiUrl?: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.policy
    ._ctx.transaction(transactionStatusApiUrl);
}

export function queryEnterpriseLearnerOffers(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.enterpriseOffers;
}

export function queryCouponCodes(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.couponCodes;
}

export function queryBrowseAndRequestConfiguration(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.configuration;
}

export function queryRequestsContextQueryKey(enterpriseUuid: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest._ctx.requests._def;
}

export function queryLicenseRequests(
  enterpriseUuid: string,
  userEmail: string,
  state: SubsidyRequestState = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.requests(userEmail, state)
    ._ctx.licenseRequests;
}

export function queryCouponCodeRequests(
  enterpriseUuid: string,
  userEmail: string,
  state: SubsidyRequestState = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.requests(userEmail, state)
    ._ctx.couponCodeRequests;
}

export function queryLearnerCreditRequests(
  enterpriseUuid: string,
  userEmail: string,
  state?: SubsidyRequestState,
) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest
    ._ctx.requests(userEmail, state)
    ._ctx.learnerCreditRequests;
}

export function queryLearnerProgramProgressData(programUUID: string) {
  return queries
    .content
    .program(programUUID)
    ._ctx.progress;
}

export function queryEnterpriseProgram(enterpriseUuid: string, programUUID: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.programs
    ._ctx.detail(programUUID);
}

export function queryLearnerPathwayProgressData(pathwayUUID: string) {
  return queries
    .content
    .pathway(pathwayUUID)
    ._ctx.progress;
}

export function queryVideoDetail(videoUUID: string, enterpriseUUID: string) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUUID)
    ._ctx.video
    ._ctx.detail(videoUUID);
}

// BFF queries

export function queryEnterpriseLearnerDashboardBFF({ enterpriseSlug }: BFFRequestOptions) {
  return queries
    .bff
    .enterpriseSlug(enterpriseSlug)
    ._ctx.route
    ._ctx.dashboard;
}

export function queryEnterpriseLearnerSearchBFF({ enterpriseSlug }: BFFRequestOptions) {
  return queries
    .bff
    .enterpriseSlug(enterpriseSlug)
    ._ctx.route
    ._ctx.search;
}

export function queryEnterpriseLearnerAcademyBFF({ enterpriseSlug }: BFFRequestOptions) {
  return queries
    .bff
    .enterpriseSlug(enterpriseSlug)
    ._ctx.route
    ._ctx.academy;
}

export function queryEnterpriseLearnerSkillsQuizBFF({ enterpriseSlug }: BFFRequestOptions) {
  return queries
    .bff
    .enterpriseSlug(enterpriseSlug)
    ._ctx.route
    ._ctx.skillsQuiz;
}

export function queryDefaultEmptyFallback() {
  return queries
    .bff
    .defaultEmptyFallback;
}
