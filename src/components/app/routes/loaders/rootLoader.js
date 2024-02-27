import { ensureEnterpriseAppData, makeEnterpriseLearnerQuery } from '../queries';
import {
  ensureAuthenticatedUser,
  redirectToSearchPageForNewUser,
} from '../data';

/**
 * Root loader for the enterprise learner portal.
 * @param {Object} queryClient - The query client.
 * @returns A loader function.
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

    // Begin fetching all enterprise app data.
    const enterpriseAppData = await Promise.all(ensureEnterpriseAppData({
      enterpriseCustomer: activeEnterpriseCustomer,
      userId,
      userEmail,
      queryClient,
    }));

    // Redirect user to search page, for first-time users with no assignments.
    redirectToSearchPageForNewUser({
      enterpriseSlug,
      enterpriseAppData,
      requestUrl,
    });

    return null;
  };
}
