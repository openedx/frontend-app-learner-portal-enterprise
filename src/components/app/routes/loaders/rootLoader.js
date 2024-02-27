import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import {
  makeBrowseAndRequestConfigurationQuery,
  makeCouponCodesQuery,
  makeEnterpriseLearnerOffersQuery,
  makeEnterpriseLearnerQuery,
  makeRedeemablePoliciesQuery,
  makeSubscriptionsQuery,
  makeContentHighlightsConfigurationQuery,
} from '../data/services';
// import {
//   makeBrowseAndRequestConfigurationQuery,
//   makeCouponCodesQuery,
//   makeEnterpriseLearnerOffersQuery,
//   makeEnterpriseLearnerQuery,
//   makeRedeemablePoliciesQuery,
//   makeSubscriptionsQuery,
//   makeContentHighlightsConfigurationQuery,
// } from '../queries';

export const updateUserActiveEnterprise = async ({ enterpriseCustomer }) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/select/active/`;
  const formData = new FormData();
  formData.append('enterprise', enterpriseCustomer.uuid);
  return getAuthenticatedHttpClient().post(url, formData);
};

export function getEnterpriseAppData({
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

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeRootLoader(queryClient) {
  return async function rootLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl);
    const { username, userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    // Retrieve linked enterprise customers for the current user from query cache
    // or fetch from the server if not available.
    const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(username, enterpriseSlug);
    const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
    const { activeEnterpriseCustomer } = enterpriseLearnerData;

    // User has no active, linked enterprise customer; return early.
    if (!activeEnterpriseCustomer) {
      return null;
    }

    await Promise.all(getEnterpriseAppData({
      enterpriseCustomer: activeEnterpriseCustomer,
      userId,
      userEmail,
      queryClient,
    }));
    return null;
  };
}
