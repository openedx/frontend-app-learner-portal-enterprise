import { updateUserActiveEnterprise } from '../services';
import ensureEnterpriseAppData from './ensureEnterpriseAppData';
import queryEnterpriseLearner from './enterpriseLearner';

export { default as queryCanRedeem } from './canRedeemCourse';
export { default as queryContentHighlightsConfiguration } from './contentHighlights';
export { default as queryCourseMetadata } from './courseMetadata';
export { default as queryEnterpriseCourseEnrollments } from './enterpriseCourseEnrollments';
export { default as queryUserEntitlements } from './userEntitlements';
export { default as ensureEnterpriseAppData } from './ensureEnterpriseAppData';

export {
  queryEnterpriseLearner,
};

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

/**
 * Extracts the appropriate enterprise ID for the current user and enterprise slug.
 * @param {Object} params - The parameters object.
 * @param {Object} params.queryClient - The query client.
 * @param {Object} params.authenticatedUser - The authenticated user.
 * @param {string} params.enterpriseSlug - The enterprise slug.
 * @returns {Promise<string>} - The enterprise ID to use for subsquent queries in route loaders.
 */
export async function extractEnterpriseId({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
}) {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);
  const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
  const {
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  } = enterpriseLearnerData;

  // If there is no slug provided (i.e., on the root page route `/`), use
  // the currently active enterprise customer.
  if (!enterpriseSlug) {
    return activeEnterpriseCustomer.uuid;
  }

  // Otherwise, there is a slug provided for a specific enterprise customer. If the
  // enterprise customer for the given slug is associated to one linked to the learner,
  // return the enterprise ID for that enterprise customer.
  const foundEnterpriseIdForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  )?.enterpriseCustomer.uuid;

  if (foundEnterpriseIdForSlug) {
    return foundEnterpriseIdForSlug;
  }

  // If no enterprise customer is found for the given user/slug, throw an error.
  throw new Error(`Could not find enterprise customer for user ${authenticatedUser.userId} and slug ${enterpriseSlug}`);
}
