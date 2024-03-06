import { queryEnterpriseLearner } from './queries';

export * from './queries';

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
