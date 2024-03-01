import { updateUserActiveEnterprise } from '../services';
import ensureEnterpriseAppData from './ensureEnterpriseAppData';
import queryEnterpriseLearner from './enterpriseLearner';

export { default as queryCanRedeem } from './canRedeemCourse';
export { default as queryContentHighlightsConfiguration } from './contentHighlights';
export { default as queryCourseMetadata } from './courseMetadata';
export { default as queryEnterpriseCourseEnrollments } from './enterpriseCourseEnrollments';
export { default as queryEnterpriseLearner } from './enterpriseLearner';
export { default as queryUserEntitlements } from './userEntitlements';
export { default as ensureEnterpriseAppData } from './ensureEnterpriseAppData';

export * from './subsidies';

/**
 * Updates the active enterprise customer for the learner.
 * @param {Object} params - The parameters object.
 * @param {Object} params.enterpriseCustomerUser - The enterprise customer user.
 * @param {Object[]} params.allLinkedEnterpriseCustomerUsers - All linked enterprise customer users.
 * @param {string} params.userId - The user ID.
 * @param {string} params.userEmail - The user email.
 * @param {string} params.username - The user username.
 * @param {Object} params.queryClient - The query client.
 * @returns {Promise<void>} - A promise that resolves when the active enterprise customer is updated
 *  and the query cache is updated with fresh data.
 */
export async function updateActiveEnterpriseCustomerUser({
  enterpriseCustomerUser,
  allLinkedEnterpriseCustomerUsers,
  userId,
  userEmail,
  username,
  queryClient,
}) {
  // Makes the POST API request to update the active enterprise customer
  // for the learner in the backend for future sessions.
  await updateUserActiveEnterprise({
    enterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
  });
  // Perform optimistic update of the query cache to avoid duplicate API request for the same data. The only
  // difference is that the query key now contains the new enterprise slug, so we can proactively set the query
  // cache for with the enterprise learner data we already have before resolving the loader.
  const enterpriseLearnerQuery = queryEnterpriseLearner(username, enterpriseCustomerUser.enterpriseCustomer.slug);
  queryClient.setQueryData(enterpriseLearnerQuery.queryKey, {
    enterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
    enterpriseCustomerUserRoleAssignments: enterpriseCustomerUser.roleAssignments,
    activeEnterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments: enterpriseCustomerUser.roleAssignments,
    allLinkedEnterpriseCustomerUsers: allLinkedEnterpriseCustomerUsers.map(
      ecu => ({
        ...ecu,
        active: (
          ecu.enterpriseCustomer.uuid === enterpriseCustomerUser.enterpriseCustomer.uuid
        ),
      }),
    ),
  });
  // Refetch all enterprise app data for the new active enterprise customer.
  await Promise.all(ensureEnterpriseAppData({
    enterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
    userId,
    userEmail,
    queryClient,
  }));
}
