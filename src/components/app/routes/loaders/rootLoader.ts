import { getConfig } from '@edx/frontend-platform/config';
import { getEnterpriseLearnerQueryData, queryNotices } from '../../data';
import {
  ensureActiveEnterpriseCustomerUser,
  ensureAuthenticatedUser,
  ensureEnterpriseAppData,
  redirectToRemoveTrailingSlash,
} from '../data';

/**
 * Root loader for the enterprise learner portal.
 */
const makeRootLoader: MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
  return async function rootLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    if (getConfig().ENABLE_NOTICES) {
      // Handle any notices before proceeding.
      const noticesRedirectUrl = await queryClient.ensureQueryData(queryNotices());
      if (noticesRedirectUrl) {
        global.location.assign(noticesRedirectUrl);
        return null;
      }
    }

    const { userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    const { data: enterpriseLearnerData, isBFFData } = await getEnterpriseLearnerQueryData({
      requestUrl,
      queryClient,
      enterpriseSlug,
      authenticatedUser,
    });

    // User has no active, linked enterprise customer and no staff-only customer metadata exists; return early.
    if (!enterpriseLearnerData.enterpriseCustomer && !enterpriseLearnerData.activeEnterpriseCustomer) {
      return null;
    }

    // 1. If the active enterprise customer user was updated, override the previous active
    //    enterprise customer user data with the new active enterprise customer user data
    //    for subsequent queries.
    // 2. If no enterpriseCustomer exists, redirects the user to the activeEnterpriseCustomer
    //    at the same page route.
    const {
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    } = await ensureActiveEnterpriseCustomerUser({
      enterpriseSlug,
      enterpriseLearnerData,
      isBFFData,
      requestUrl,
      authenticatedUser,
      queryClient,
    });

    // Fetch all enterprise app data.
    await ensureEnterpriseAppData({
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      userId,
      userEmail,
      queryClient,
      requestUrl,
    });

    // Redirect to the same URL without a trailing slash, if applicable.
    redirectToRemoveTrailingSlash(requestUrl);

    return null;
  };
};

export default makeRootLoader;
