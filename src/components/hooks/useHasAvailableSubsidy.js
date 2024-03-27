import { useMemo } from 'react';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';
import {
  useBrowseAndRequest, useCouponCodes, useEnterpriseOffers, useRedeemablePolicies, useSubscriptions,
} from '../app/data';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from '../dashboard/sidebar/utils';

function getLearnerCreditSummaryCardData({ enterpriseOffers, redeemableLearnerCreditPolicies }) {
  const learnerCreditPolicyExpiringFirst = getPolicyExpiringFirst(redeemableLearnerCreditPolicies?.redeemablePolicies);
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
export default function useHasAvailableSubsidy() {
  const { data: subscriptions } = useSubscriptions();
  const { data: { requests } } = useBrowseAndRequest();
  const { data: couponCodes } = useCouponCodes();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const { data: enterpriseOffersData } = useEnterpriseOffers();

  const learnerCreditSummaryCardData = useMemo(() => (getLearnerCreditSummaryCardData({
    enterpriseOffers: enterpriseOffersData.enterpriseOffers,
    redeemableLearnerCreditPolicies,
  })), [enterpriseOffersData.enterpriseOffers, redeemableLearnerCreditPolicies]);

  const hasActiveLicenseOrLicenseRequest = (
    subscriptions.subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
      || requests.subscriptionLicenses.length > 0
  );

  const hasAssignedCodesOrCodeRequests = (
    couponCodes.couponCodeAssignments.length > 0
      || requests.couponCodes.length > 0
  );
  const hasAvailableLearnerCreditPolicies = redeemableLearnerCreditPolicies?.redeemablePolicies.length > 0;

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
