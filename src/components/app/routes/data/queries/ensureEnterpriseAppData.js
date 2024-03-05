import dayjs from 'dayjs';
import { getConfig } from '@edx/frontend-platform';

import { activateLicense, requestAutoAppliedUserLicense } from '../services';
import { activateOrAutoApplySubscriptionLicense } from '../utils';
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

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export default async function ensureEnterpriseAppData({
  enterpriseCustomer,
  userId,
  userEmail,
  queryClient,
  requestUrl,
}) {
  const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
  const enterpriseAppDataQueries = [
    // Enterprise Customer User Subsidies
    queryClient.ensureQueryData(subscriptionsQuery).then(async (subscriptionsData) => {
      // Auto-activate the user's subscription license, if applicable.
      await activateOrAutoApplySubscriptionLicense({
        enterpriseCustomer,
        requestUrl,
        subscriptionsData,
        async activateAllocatedSubscriptionLicense(subscriptionLicenseToActivate) {
          await activateLicense(subscriptionLicenseToActivate.activationKey);
          const autoActivatedSubscriptionLicense = {
            ...subscriptionLicenseToActivate,
            status: 'activated',
            activationDate: dayjs().toISOString(),
          };
          // Optimistically update the query cache with the auto-activated subscription license.
          queryClient.setQueryData(subscriptionsQuery.queryKey, {
            ...subscriptionsData,
            subscriptionLicenses: subscriptionsData.subscriptionLicenses.map((license) => {
              if (license.uuid === autoActivatedSubscriptionLicense.uuid) {
                return autoActivatedSubscriptionLicense;
              }
              return license;
            }),
          });
        },
        async requestAutoAppliedSubscriptionLicense(customerAgreement) {
          const autoAppliedSubscriptionLicense = await requestAutoAppliedUserLicense(customerAgreement.uuid);
          // Optimistically update the query cache with the auto-applied subscription license.
          queryClient.setQueryData(subscriptionsQuery.queryKey, {
            ...subscriptionsData,
            subscriptionLicenses: [autoAppliedSubscriptionLicense],
          });
        },
      });
      return subscriptionsData;
    }),
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
  if (getConfig().ENABLE_NOTICES) {
    enterpriseAppDataQueries.push(
      queryClient.ensureQueryData(
        queryNotices(),
      ),
    );
  }
  const enterpriseAppData = await Promise.all(enterpriseAppDataQueries);
  return enterpriseAppData;
}
