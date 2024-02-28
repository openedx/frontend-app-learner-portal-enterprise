import { redirect, generatePath } from 'react-router-dom';

import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import { getEnterpriseAppData, updateUserActiveEnterprise } from './rootLoader';
import { queryEnterpriseLearner } from '../data/services';
/**
 * TODO
 * @param {*} queryClient
 * @returns
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
      // Otherwise, try to find the enterprise customer for the given slug and update it as the active
      // enterprise customer for the learner.
      const foundEnterpriseCustomerUserForSlug = allLinkedEnterpriseCustomerUsers.find(
        enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
      );
      if (foundEnterpriseCustomerUserForSlug) {
        await updateUserActiveEnterprise({
          enterpriseCustomer: foundEnterpriseCustomerUserForSlug.enterpriseCustomer,
        });
        queryClient.setQueryData(linkedEnterpriseCustomersQuery.queryKey, {
          ...enterpriseLearnerData,
          activeEnterpriseCustomer: foundEnterpriseCustomerUserForSlug.enterpriseCustomer,
          allLinkedEnterpriseCustomerUsers: allLinkedEnterpriseCustomerUsers.map(
            ecu => ({
              ...ecu,
              active: (
                ecu.enterpriseCustomer.uuid === foundEnterpriseCustomerUserForSlug.enterpriseCustomer.uuid
              ),
            }),
          ),
        });
        await Promise.all(getEnterpriseAppData({
          enterpriseCustomer: foundEnterpriseCustomerUserForSlug.enterpriseCustomer,
          userId,
          userEmail,
          queryClient,
        }));
        return null;
      }

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
