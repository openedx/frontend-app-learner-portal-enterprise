import { useMemo } from 'react';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from '../../../dashboard/sidebar/utils';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import useBrowseAndRequest from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';
import useEnterpriseOffers from './useEnterpriseOffers';
import useRedeemablePolicies from './useRedeemablePolicies';
import useSubscriptions from './useSubscriptions';

function getLearnerCreditSummaryCardData({ enterpriseOffers, expiredPolicies, unexpiredPolicies }) {
  const learnerCreditPolicyExpiringFirst = getPolicyExpiringFirst({ expiredPolicies, unexpiredPolicies });
  const enterpriseOfferExpiringFirst = getOfferExpiringFirst(enterpriseOffers);
  if (!learnerCreditPolicyExpiringFirst && !enterpriseOfferExpiringFirst) {
    return undefined;
  }

  return {
    expirationDate: (
      learnerCreditPolicyExpiringFirst?.subsidyExpirationDate || enterpriseOfferExpiringFirst?.endDatetime
    ),
  };
}

/**
 *
 * @returns {{
 * hasAvailableLearnerCreditPolicies: boolean,
 * hasAssignedCodesOrCodeRequests: boolean,
 * hasActiveLicenseOrLicenseRequest: boolean,
 * learnerCreditSummaryCardData: {expirationDate},
 * hasAvailableSubsidyOrRequests: ({expirationDate}|boolean)
 * }}
 */
export default function useHasAvailableSubsidiesOrRequests() {
  const { data: subscriptions } = useSubscriptions();
  const { data: { requests } } = useBrowseAndRequest();
  const { data: couponCodes } = useCouponCodes();
  const { data: { expiredPolicies, unexpiredPolicies, redeemablePolicies } } = useRedeemablePolicies();
  const { data: enterpriseOffersData } = useEnterpriseOffers();
  const learnerCreditSummaryCardData = useMemo(() => getLearnerCreditSummaryCardData({
    enterpriseOffers: enterpriseOffersData.currentEnterpriseOffers,
    expiredPolicies,
    unexpiredPolicies,
  }), [enterpriseOffersData.currentEnterpriseOffers, expiredPolicies, unexpiredPolicies]);

  const hasActiveLicenseOrLicenseRequest = (
    subscriptions.subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
      || requests.subscriptionLicenses.length > 0
  );
  const hasAssignedCodesOrCodeRequests = (
    couponCodes.couponCodeAssignments.length > 0
      || requests.couponCodes.length > 0
  );
  const hasAvailableLearnerCreditPolicies = redeemablePolicies.length > 0;

  const hasAvailableSubsidyOrRequests = (
    hasActiveLicenseOrLicenseRequest || hasAssignedCodesOrCodeRequests || learnerCreditSummaryCardData
  );

  return {
    hasAvailableSubsidyOrRequests,
    hasAvailableLearnerCreditPolicies,
    hasAssignedCodesOrCodeRequests,
    hasActiveLicenseOrLicenseRequest,
    learnerCreditSummaryCardData,
  };
}
