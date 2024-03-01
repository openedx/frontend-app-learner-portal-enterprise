import { redirect, generatePath } from 'react-router-dom';

import { ensureAuthenticatedUser, updateActiveEnterpriseCustomerUser } from '../data';
import { queryEnterpriseLearner } from '../data/queries';
/**
 * Updates the active enterprise customer for the learner, when the user navigates to a different enterprise
 * customer's page.
 * @param {Object} queryClient - The query client.
 * @returns {Function} - A loader function.
 */
export default function makeUpdateActiveEnterpriseCustomerUserLoader(queryClient) {
  return async function updateActiveEnterpriseCustomerUserLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl);
    const { username, userId, email: userEmail } = authenticatedUser;
    const { enterpriseSlug } = params;

    const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(username, enterpriseSlug);
    const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
    const {
      activeEnterpriseCustomer,
      activeEnterpriseCustomerUserRoleAssignments,
      allLinkedEnterpriseCustomerUsers,
    } = enterpriseLearnerData;

    // User has no active, linked enterprise customer; return early.
    if (!activeEnterpriseCustomer) {
      return null;
    }

    if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
      // Otherwise, try to find the enterprise customer for the given slug and, if found, update it
      // as the active enterprise customer for the learner.
      const foundEnterpriseCustomerUserForSlug = allLinkedEnterpriseCustomerUsers.find(
        enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
      );
      if (foundEnterpriseCustomerUserForSlug) {
        await updateActiveEnterpriseCustomerUser({
          queryClient,
          enterpriseCustomerUser: foundEnterpriseCustomerUserForSlug,
          userId,
          userEmail,
          username,
          allLinkedEnterpriseCustomerUsers,
        });
        return null;
      }

      // Perform optimistic update of the query cache to avoid duplicate API request for the same
      // data. The only difference is that the query key now contains the enterprise slug (it was
      // previousy `undefined`), so we can proactively set the query cache for with the enterprise
      // learner data we already have before performing the redirect.
      const nextEnterpriseLearnerQuery = queryEnterpriseLearner(username, activeEnterpriseCustomer.slug);
      queryClient.setQueryData(nextEnterpriseLearnerQuery.queryKey, {
        enterpriseCustomer: activeEnterpriseCustomer,
        enterpriseCustomerUserRoleAssignments: activeEnterpriseCustomerUserRoleAssignments,
        activeEnterpriseCustomer,
        activeEnterpriseCustomerUserRoleAssignments,
        allLinkedEnterpriseCustomerUsers,
      });
      return redirect(generatePath('/:enterpriseSlug/*', {
        enterpriseSlug: activeEnterpriseCustomer.slug,
        '*': requestUrl.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
      }));
    }

    return null;
  };
}
