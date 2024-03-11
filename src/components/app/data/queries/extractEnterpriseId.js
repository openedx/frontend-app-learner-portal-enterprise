import { queryEnterpriseLearner } from './queries';

/**
 * Extracts the appropriate enterprise ID for the current user and enterprise slug.
 * @param {Object} params - The parameters object.
 * @param {Object} params.queryClient - The query client.
 * @param {Object} params.authenticatedUser - The authenticated user.
 * @param {string} params.enterpriseSlug - The enterprise slug.
 * @returns {Promise<string>} - The enterprise ID to use for subsquent queries in route loaders.
 */
async function extractEnterpriseId({
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
    staffEnterpriseCustomer,
  } = enterpriseLearnerData;

  // If there is no slug provided (i.e., on the root page route `/`), use
  // the currently active enterprise customer user.
  if (!enterpriseSlug) {
    return activeEnterpriseCustomer.uuid;
  }

  const foundEnterpriseIdForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  )?.enterpriseCustomer.uuid;

  // Otherwise, there is a slug provided for a specific enterprise customer. If the
  // user is linked to the enterprise customer for the given slug, return the enterprise
  // enterprise ID for that enterprise customer. If there is no linked enterprise customer
  // for the given slug, but the user is staff, return the enterprise ID from the staff-only
  // enterprise customer metadata.
  if (foundEnterpriseIdForSlug || staffEnterpriseCustomer) {
    return foundEnterpriseIdForSlug || staffEnterpriseCustomer.uuid;
  }

  // If no enterprise customer is found for the given user/slug, throw an error.
  throw new Error(`Could not find enterprise customer for user ${authenticatedUser.userId} and slug ${enterpriseSlug}`);
}

export default extractEnterpriseId;
