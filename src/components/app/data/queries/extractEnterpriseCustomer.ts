import { logError } from '@edx/frontend-platform/logging';
import { getEnterpriseLearnerQueryData } from './utils';

interface ExtractEnterpriseCustomerArgs {
  requestUrl: URL,
  queryClient: Types.QueryClient;
  authenticatedUser: Types.AuthenticatedUser;
  enterpriseSlug?: string;
}

/**
 * Extracts the appropriate enterprise ID for the current user and enterprise slug.
 */
async function extractEnterpriseCustomer({
  requestUrl,
  queryClient,
  authenticatedUser,
  enterpriseSlug,
} : ExtractEnterpriseCustomerArgs): Promise<Types.EnterpriseCustomer | null> {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const { data: enterpriseLearnerData } = await getEnterpriseLearnerQueryData({
    requestUrl,
    queryClient,
    authenticatedUser,
    enterpriseSlug,
  });
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

  // If no enterprise customer is found for the given user/slug, log an error and display a 404 from return null.
  logError(`Could not find enterprise customer for slug ${enterpriseSlug}`);
  return null;
}

export default extractEnterpriseCustomer;
