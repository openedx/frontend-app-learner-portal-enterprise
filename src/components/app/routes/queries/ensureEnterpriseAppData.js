import makeContentHighlightsConfigurationQuery from './contentHighlights';
import {
  makeBrowseAndRequestConfigurationQuery,
  makeCouponCodesQuery,
  makeEnterpriseLearnerOffersQuery,
  makeRedeemablePoliciesQuery,
  makeSubscriptionsQuery,
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
      makeSubscriptionsQuery(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      makeRedeemablePoliciesQuery({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: userId,
      }),
    ),
    queryClient.ensureQueryData(
      makeCouponCodesQuery(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      makeEnterpriseLearnerOffersQuery(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      makeBrowseAndRequestConfigurationQuery(enterpriseCustomer.uuid, userEmail),
    ),
    // Content Highlights
    queryClient.ensureQueryData(
      makeContentHighlightsConfigurationQuery(enterpriseCustomer.uuid),
    ),
  ];
}
