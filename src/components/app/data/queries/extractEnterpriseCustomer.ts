import { queryEnterpriseLearner } from './queries';

interface ExtractEnterpriseCustomerArgs {
  queryClient: Types.QueryClient;
  authenticatedUser: Types.AuthenticatedUser;
  enterpriseSlug?: string;
}

/**
 * Extracts the appropriate enterprise ID for the current user and enterprise slug.
 */
async function extractEnterpriseCustomer({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
} : ExtractEnterpriseCustomerArgs) : Promise<Types.EnterpriseCustomer> {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);
  const enterpriseLearnerData = await queryClient.ensureQueryData<Types.EnterpriseLearnerData>(
    linkedEnterpriseCustomersQuery,
  );
  const {
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
    staffEnterpriseCustomer,
  } = enterpriseLearnerData;

  // If there is no slug provided (i.e., on the root page route `/`), use
  // the currently active enterprise customer user.
  if (!enterpriseSlug) {
    return activeEnterpriseCustomer;
  }

  const foundEnterpriseCustomerForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer?.slug === enterpriseSlug,
  )?.enterpriseCustomer;

  // Otherwise, there is a slug provided for a specific enterprise customer. If the
  // user is linked to the enterprise customer for the given slug, return the enterprise
  // enterprise ID for that enterprise customer. If there is no linked enterprise customer
  // for the given slug, but the user is staff, return the enterprise ID from the staff-only
  // enterprise customer metadata.
  if (foundEnterpriseCustomerForSlug || staffEnterpriseCustomer) {
    return foundEnterpriseCustomerForSlug || staffEnterpriseCustomer;
  }

  // If no enterprise customer is found for the given user/slug, throw an error.
  throw new Error(`Could not find enterprise customer for slug ${enterpriseSlug}`);
}

export default extractEnterpriseCustomer;
