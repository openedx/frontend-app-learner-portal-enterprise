import { getConfig } from '@edx/frontend-platform/config';
import queryContentHighlightsConfiguration from './contentHighlights';
import {
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  queryBrowseAndRequestConfiguration,
} from './subsidies';
import queryNotices from './notices';

export default function ensureEnterpriseAppData({
  enterpriseCustomer,
  userId,
  userEmail,
  queryClient,
}) {
  const enterpriseAppData = [
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
      queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
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
  if (!getConfig().ENABLE_NOTICES) {
    enterpriseAppData.push(
      queryClient.ensureQueryData(
        queryNotices(),
      ),
    );
  }
  return enterpriseAppData;
}
