/* eslint-disable no-underscore-dangle */
import { queries } from '../../../../utils/queryKeyFactory';
import { getAvailableCourseRuns } from '../../../course/data/utils';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests';

/**
 * Helper function to assist querying with useQuery package
 * queries.user.entitlements
 * @returns
 */
export function queryUserEntitlements() {
  return queries.user.entitlements;
}

// 'enterprise' context layer START
// 'enterpriseCustomer' context layer START
// 'enterpriseCustomer' contextQueries START

// 'contentHighlights' context layer START
// 'contentHighlights' contextQueries START
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
// 'contentHighlights' contextQueries END

// 'course' context layer START
// 'course' contextQueries START
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
// 'course' contextQueries END
// 'course' context layer START

// 'enrollments' context layer START
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
// 'enrollments' context layer END

// 'subsidies' context layer START
// 'subsidies' contextQueries START

// 'browseAndRequest' context layer START
// 'browseAndRequest' contextQueries START
/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest(userEmail)
 * ._ctx.configuration
 * @returns
 */
export function queryBrowseAndRequestConfiguration(enterpriseUuid, userEmail) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest(userEmail)
    ._ctx.configuration;
}

// 'endpoints' context layer START
// 'endpoint contextQueries START
/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest(userEmail)
 * ._ctx.endpoints(state)
 * ._ctx.licenseRequests
 * @returns
 */
export function queryLicenseRequests(enterpriseUuid, userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest(userEmail)
    ._ctx.endpoints(state)
    ._ctx.licenseRequests;
}

/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.browseAndRequest(userEmail)
 * ._ctx.endpoints(state)
 * ._ctx.couponCodeRequests
 * @returns
 */
export function queryCouponCodeRequests(enterpriseUuid, userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest(userEmail)
    ._ctx.endpoints(state)
    ._ctx.couponCodeRequests;
}
// 'endpoint' contextQueries END
// 'endpoint' context layer END

// 'browseAndRequest' contextQueries END
// 'browseAndRequest' context layer END

// 'couponCodes' context layer START
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
// 'couponCodes' context layer END

// 'enterpriseOffers' context layer START
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
// 'enterpriseOffers' context layer END

// 'policy' context layer START
// 'policy' contextQueries START
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
// 'policy' contextQueries END
// 'policy' context layer END

// 'subscriptions' context layer START
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
// 'subscriptions' context layer END
// 'subsidies' contextQueries END
// 'subsidies' context layer END
//  'enterpriseCustomer' contextQueries END
// 'enterpriseCustomer' context layer END

// enterpriseLearner context layer START
/**
 * Helper function to assist querying with useQuery package
 * queries
 * .enterprise
 * .enterpriseLearner(username, enterpriseSlug)
 * @returns
 */
export function queryEnterpriseLearner(username, enterpriseSlug) {
  return queries
    .enterprise
    .enterpriseLearner(username, enterpriseSlug);
}
// 'enterpriseLearner' context layer END
// 'enterprise' context layer END
