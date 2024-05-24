import { determineLearnerHasContentAssignmentsOnly } from '../utils';
import useBrowseAndRequest from './useBrowseAndRequest';
import useCouponCodes from './useCouponCodes';
import useEnterpriseOffers from './useEnterpriseOffers';
import useRedeemablePolicies from './useRedeemablePolicies';
import useSubscriptions from './useSubscriptions';

export default function useIsAssignmentsOnlyLearner() {
  const {
    data: {
      subscriptionPlan,
      subscriptionLicense,
    },
  } = useSubscriptions();
  const {
    data: {
      requests: {
        subscriptionLicenses: licenseRequests,
        couponCodes: couponCodeRequests,
      },
    },
  } = useBrowseAndRequest();
  const { data: { couponCodeRedemptionCount } } = useCouponCodes();
  const { data: { hasCurrentEnterpriseOffers } } = useEnterpriseOffers();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();

  const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
    subscriptionPlan,
    subscriptionLicense,
    licenseRequests,
    couponCodeRequests,
    couponCodesCount: couponCodeRedemptionCount,
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
  });

  return isAssignmentOnlyLearner;
}
