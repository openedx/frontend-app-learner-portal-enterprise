import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { getAssignmentsByState, transformRedeemablePoliciesData } from '../../utils';
import { fetchPaginatedData } from '../utils';

//  Enterprise Offers

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchEnterpriseOffers(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
    discount_value: 100,
    status: ENTERPRISE_OFFER_STATUS.OPEN,
    page_size: 100,
    ...options,
  });
  const url = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/enterprise/${enterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;
  try {
    const { results } = await fetchPaginatedData(url);
    return results;
  } catch (error) {
    logError(error);
    return [];
  }
}

// Redeemable Policies

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userID
 * @returns
 */
export async function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const responseData = camelCaseObject(response.data);
    const redeemablePolicies = transformRedeemablePoliciesData(responseData);
    const learnerContentAssignments = getAssignmentsByState(
      redeemablePolicies?.flatMap(item => item.learnerContentAssignments || []),
    );
    return {
      redeemablePolicies,
      learnerContentAssignments,
    };
  } catch (error) {
    logError(error);
    return {
      redeemablePolicies: [],
      learnerContentAssignments: [],
    };
  }
}

export * from './browseAndRequest';
export * from './subscriptions';
export * from './couponCodes';
