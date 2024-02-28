/* eslint-disable no-underscore-dangle */
import { queries } from '../../../../utils/queryKeyFactory';
import { getAvailableCourseRuns } from '../../../course/data/utils';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests';

export function makeUserEntitlementsQuery() {
  return queries.user.entitlements;
}

// 'enterprise' context layer START
// 'enterpriseCustomer' context layer START
// 'enterpriseCustomer' contextQueries START

// 'contentHighlights' context layer START
// 'contentHighlights' contextQueries START
export function makeContentHighlightsConfigurationQuery(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.contentHighlights
    ._ctx.configuration;
}
// 'contentHighlights' contextQueries END

// 'course' context layer START
// 'course' contextQueries START
export function makeCourseMetadataQuery(enterpriseUuid, courseKey) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.course
    ._ctx.contentMetadata(courseKey);
}
export function makeCanRedeemQuery(enterpriseUuid, courseMetadata) {
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
export function makeEnterpriseCourseEnrollmentsQuery(enterpriseUuid) {
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
export function makeBrowseAndRequestConfigurationQuery(enterpriseUuid, userEmail) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest(userEmail)
    ._ctx.configuration;
}

// 'endpoints' context layer START
// 'endpoint contextQueries START
export function queryLicenseRequests(enterpriseUuid, userEmail, state = SUBSIDY_REQUEST_STATE.REQUESTED) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.browseAndRequest(userEmail)
    ._ctx.endpoints(state)
    ._ctx.licenseRequests;
}

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
export function makeCouponCodesQuery(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.couponCodes;
}
// 'couponCodes' context layer END

// 'enterpriseOffers' context layer START
export function makeEnterpriseLearnerOffersQuery(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.enterpriseOffers;
}
// 'enterpriseOffers' context layer END

// 'policy' context layer START
// 'policy' contextQueries START
export function makeRedeemablePoliciesQuery({ enterpriseUuid, lmsUserId }) {
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
export function makeSubscriptionsQuery(enterpriseUuid) {
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
export function makeEnterpriseLearnerQuery(username, enterpriseSlug) {
  return queries
    .enterprise
    .enterpriseLearner(username, enterpriseSlug);
}
