import queryContentHighlightsConfiguration from './contentHighlights';
import {
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  querySubsidyRequestConfiguration,
} from './subsidies';

export default function ensureEnterpriseAppData({
  enterpriseCustomer,
  userId,
  userEmail,
  queryClient,
}) {
  return [
    // Enterprise Customer User Subsidies
    queryClient.ensureQueryData(
      querySubscriptions(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: userId,
      }),
    ),
    queryClient.ensureQueryData(
      queryCouponCodes(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      querySubsidyRequestConfiguration(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryLicenseRequests(enterpriseCustomer.uuid, userEmail),
    ),
    queryClient.ensureQueryData(
      queryCouponCodeRequests(enterpriseCustomer.uuid, userEmail),
    ),
    // Content Highlights
    queryClient.ensureQueryData(
      queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
    ),
  ];
}
