import { getConfig } from '@edx/frontend-platform/config';
import { logError } from '@edx/frontend-platform/logging';
import { queryEnterpriseLearner, queryNotices } from '../../data';
import {
  ensureActiveEnterpriseCustomerUser,
  ensureAuthenticatedUser,
  ensureEnterpriseAppData,
  redirectToRemoveTrailingSlash,
} from '../data';

/**
 * Root loader for the enterprise learner portal.
 */
const makeRootLoader: Types.MakeRouteLoaderFunctionWithQueryClient = function makeRootLoader(queryClient) {
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

    const { username, userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    // Retrieve linked enterprise customers for the current user from query cache
    // or fetch from the server if not available.
    try {
      const enterpriseLearnerData = await queryClient.ensureQueryData<Types.EnterpriseLearnerData>(
        queryEnterpriseLearner(username, enterpriseSlug),
      );
      let {
        enterpriseCustomer,
        activeEnterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
      } = enterpriseLearnerData;
      // User has no active, linked enterprise customer and no staff-only customer metadata exists; return early.
      if (!enterpriseCustomer) {
        return null;
      }
      const { staffEnterpriseCustomer, enterpriseFeatures } = enterpriseLearnerData;
      // Ensure the active enterprise customer user is updated, when applicable (e.g., the
      // current enterprise slug in the URL does not match the active enterprise customer's slug).
      const updateActiveEnterpriseCustomerUserResult = await ensureActiveEnterpriseCustomerUser({
        enterpriseSlug,
        activeEnterpriseCustomer,
        staffEnterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
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
        enterpriseCustomer = nextActiveEnterpriseCustomer;
        activeEnterpriseCustomer = nextActiveEnterpriseCustomer;
        allLinkedEnterpriseCustomerUsers = updatedLinkedEnterpriseCustomerUsers;
      }

      // Fetch all enterprise app data.
      await ensureEnterpriseAppData({
        enterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
        userId,
        userEmail,
        queryClient,
        requestUrl,
        enterpriseFeatures,
      });

      // Redirect to the same URL without a trailing slash, if applicable.
      redirectToRemoveTrailingSlash(requestUrl);
    } catch (error) {
      // If an error occurred while fetching the enterprise learner data, log the error and return early.
      logError('Error fetching enterprise learner data:', error);
    }

    return null;
  };
};

export default makeRootLoader;
