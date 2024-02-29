/* eslint-disable no-underscore-dangle */
import { queries } from '../../../../../utils/queryKeyFactory';
import { SUBSIDY_REQUEST_STATE } from '../../../../enterprise-subsidy-requests';

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

/**
 * Helper function to assist querying with useQuery package
 * queries
 * queries
 * .enterprise
 * .enterpriseCustomer(enterpriseUuid)
 * ._ctx.subsidies
 * ._ctx.subsidyRequestConfiguration
 * @returns
 */
export function querySubsidyRequestConfiguration(enterpriseUuid) {
  return queries
    .enterprise
    .enterpriseCustomer(enterpriseUuid)
    ._ctx.subsidies
    ._ctx.subsidyRequestConfiguration;
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
    ._ctx.browseAndRequest(userEmail)
    ._ctx.requests(state)
    ._ctx.licenseRequests;
}

/**
 * Helper function to assist querying with useQuery package
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
    ._ctx.browseAndRequest(userEmail)
    ._ctx.requests(state)
    ._ctx.couponCodeRequests;
}
