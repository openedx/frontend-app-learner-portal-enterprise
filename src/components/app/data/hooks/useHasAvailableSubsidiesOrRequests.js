import { useMemo } from 'react';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from '../../../dashboard/sidebar/utils';
import useBrowseAndRequest from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';
import useEnterpriseOffers from './useEnterpriseOffers';
import useRedeemablePolicies from './useRedeemablePolicies';
import useSubscriptions from './useSubscriptions';
import { hasActivatedCurrentLicenseOrLicenseRequest, hasAssignedCodesOrCodeRequests } from '../utils';

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
 * hasActivatedCurrentLicenseOrLicenseRequest: boolean,
 * learnerCreditSummaryCardData: {expirationDate},
 * hasAvailableSubsidyOrRequests: ({expirationDate}|boolean)
 * }}
 */
export default function useHasAvailableSubsidiesOrRequests() {
  const { data: { subscriptionPlan, subscriptionLicense } } = useSubscriptions();
  const {
    data: {
      requests: {
        subscriptionLicenses: licenseRequests,
        couponCodes: couponCodeRequests,
      },
    },
  } = useBrowseAndRequest();
  const { data: { couponCodeRedemptionCount } } = useCouponCodes();
  const { data: { expiredPolicies, unexpiredPolicies, redeemablePolicies } } = useRedeemablePolicies();
  const { data: enterpriseOffersData } = useEnterpriseOffers();
  const learnerCreditSummaryCardData = useMemo(() => getLearnerCreditSummaryCardData({
    enterpriseOffers: enterpriseOffersData.currentEnterpriseOffers,
    expiredPolicies,
    unexpiredPolicies,
  }), [enterpriseOffersData.currentEnterpriseOffers, expiredPolicies, unexpiredPolicies]);

  const isActivatedCurrentLicenseOrLicenseRequest = hasActivatedCurrentLicenseOrLicenseRequest({
    subscriptionPlan, subscriptionLicense, licenseRequests,
  });
  const isAssignedCodesOrCodeRequests = hasAssignedCodesOrCodeRequests({
    couponCodesCount: couponCodeRedemptionCount, couponCodeRequests,
  });
  const hasAvailableLearnerCreditPolicies = redeemablePolicies.length > 0;

  const hasAvailableSubsidyOrRequests = (
    isActivatedCurrentLicenseOrLicenseRequest || isAssignedCodesOrCodeRequests || learnerCreditSummaryCardData
  );

  return {
    hasAvailableSubsidyOrRequests,
    hasAvailableLearnerCreditPolicies,
    hasAssignedCodesOrCodeRequests: isAssignedCodesOrCodeRequests,
    hasActivatedCurrentLicenseOrLicenseRequest: isActivatedCurrentLicenseOrLicenseRequest,
    learnerCreditSummaryCardData,
  };
}
