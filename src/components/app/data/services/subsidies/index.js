import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { ENTERPRISE_OFFER_STATUS, ENTERPRISE_OFFER_USAGE_TYPE } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { getAssignmentsByState, transformRedeemablePoliciesData } from '../../utils';
import { transformEnterpriseOffer } from '../../../../enterprise-user-subsidy/enterprise-offers/data/utils';
import { fetchPaginatedData } from '../utils';

export * from './browseAndRequest';
export * from './subscriptions';
export * from './couponCodes';

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
    const transformedEnterpriseOffers = results.map(offer => transformEnterpriseOffer(offer));
    const currentEnterpriseOffers = transformedEnterpriseOffers.filter(offer => offer.isCurrent);

    return {
      enterpriseOffers: transformedEnterpriseOffers,
      currentEnterpriseOffers,
      // Note: canEnrollWithEnterpriseOffers should be true even if there are no current offers.
      canEnrollWithEnterpriseOffers: results.length > 0,
      hasCurrentEnterpriseOffers: currentEnterpriseOffers.length > 0,
      hasLowEnterpriseOffersBalance: currentEnterpriseOffers.some(offer => offer.isLowOnBalance),
      hasNoEnterpriseOffersBalance: currentEnterpriseOffers.every(offer => offer.isOutOfBalance),
    };
  } catch (error) {
    logError(error);
    return {
      enterpriseOffers: [],
      currentEnterpriseOffers: [],
      canEnrollWithEnterpriseOffers: false,
      hasCurrentEnterpriseOffers: false,
      hasLowEnterpriseOffersBalance: false,
      hasNoEnterpriseOffersBalance: false,
    };
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
      learnerContentAssignments: {
        assignments: [],
        hasAssignments: false,
        allocatedAssignments: [],
        hasAllocatedAssignments: false,
        acceptedAssignments: [],
        hasAcceptedAssignments: false,
        canceledAssignments: [],
        hasCanceledAssignments: false,
        expiredAssignments: [],
        hasExpiredAssignments: false,
        erroredAssignments: [],
        hasErroredAssignments: false,
        assignmentsForDisplay: [],
        hasAssignmentsForDisplay: false,
      },
    };
  }
}

// Policy Transaction

/**
 * Makes an API request to retrieve the most recent payload for the
 * specified transaction. The transaction may be in various states such
 * as pending, committed, etc.
 * @param {Object} transaction
 */
export async function checkTransactionStatus(transaction) {
  const { transactionStatusApiUrl } = transaction;
  const response = await getAuthenticatedHttpClient().get(transactionStatusApiUrl);
  return camelCaseObject(response.data);
}
