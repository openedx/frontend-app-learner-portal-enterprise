import { determineLearnerHasContentAssignmentsOnly } from '../utils';
import useEnterpriseCustomerUserSubsidies from './useEnterpriseCustomerUserSubsidies';

export default function useIsAssignmentsOnlyLearner() {
  const { data: subsidies } = useEnterpriseCustomerUserSubsidies();

  const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
    subscriptionPlan: subsidies.subscriptions.subscriptionLicenses[0]?.subscriptionPlan, // assumes 1 license (if any)
    subscriptionLicense: subsidies.subscriptions.subscriptionLicenses[0], // assumes 1 license (if any)
    licenseRequests: subsidies.browseAndRequest.licenseRequests.results,
    // TODO: can we remove `couponCodesCount`?
    couponCodesCount: subsidies.browseAndRequest.couponCodeRequests.results.length,
    couponCodeRequests: subsidies.browseAndRequest.couponCodeRequests.results,
    redeemableLearnerCreditPolicies: subsidies.redeemablePolicies,
    hasCurrentEnterpriseOffers: subsidies.enterpriseLearnerOffers.results.some(
      (enterpriseOffer) => enterpriseOffer.isCurrent,
    ),
  });

  return isAssignmentOnlyLearner;
}
