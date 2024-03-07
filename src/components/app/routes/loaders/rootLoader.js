import { queryEnterpriseLearner } from '../../data';
import {
  ensureAuthenticatedUser,
  ensureEnterpriseAppData,
  redirectToRemoveTrailingSlash,
  redirectToSearchPageForNewUser,
  ensureActiveEnterpriseCustomerUser,
} from '../data';

/**
 * Root loader for the enterprise learner portal.
 * @param {Object} queryClient - The query client.
 * @returns A loader function.
 */
export default function makeRootLoader(queryClient) {
  return async function rootLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { username, userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    // Retrieve linked enterprise customers for the current user from query cache
    // or fetch from the server if not available.
    const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(username, enterpriseSlug);
    const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
    let {
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    } = enterpriseLearnerData;

    // User has no active, linked enterprise customer; return early.
    if (!activeEnterpriseCustomer) {
      return null;
    }

    // Ensure the active enterprise customer user is updated, when applicable (e.g., the
    // current enterprise slug in the URL does not match the active enterprise customer's slug).
    const updateActiveEnterpriseCustomerUserResult = await ensureActiveEnterpriseCustomerUser({
      enterpriseSlug,
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      queryClient,
      username,
      requestUrl,
    });
    // If the active enterprise customer user was updated, override the previous active
    // enterprise customer user data with the new active enterprise customer user data
    // for subsequent queries.
    if (updateActiveEnterpriseCustomerUserResult) {
      const {
        enterpriseCustomer: nextActiveEnterpriseCustomer,
        updatedLinkedEnterpriseCustomerUsers,
      } = updateActiveEnterpriseCustomerUserResult;
      activeEnterpriseCustomer = nextActiveEnterpriseCustomer;
      allLinkedEnterpriseCustomerUsers = updatedLinkedEnterpriseCustomerUsers;
    }

    // Fetch all enterprise app data.
    const enterpriseAppData = await ensureEnterpriseAppData({
      enterpriseCustomer: activeEnterpriseCustomer,
      userId,
      userEmail,
      queryClient,
      requestUrl,
    });

    // Redirect user to search page, for first-time users with no assignments.
    redirectToSearchPageForNewUser({
      enterpriseSlug,
      enterpriseAppData,
      requestUrl,
    });

    // Redirect to the same URL without a trailing slash, if applicable.
    redirectToRemoveTrailingSlash(requestUrl);

    return null;
  };
}
