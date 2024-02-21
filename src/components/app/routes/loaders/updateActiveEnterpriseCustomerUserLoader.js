import { redirect, generatePath } from 'react-router-dom';

import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import { getEnterpriseAppData, makeEnterpriseLearnerQuery, updateUserActiveEnterprise } from './rootLoader';

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

    const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(username, enterpriseSlug);
    const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
    const {
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    } = enterpriseLearnerData;

    // User has no active, linked enterprise customer; return early.
    if (!activeEnterpriseCustomer) {
      return null;
    }

    if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
      // Otherwise, try to find the enterprise customer for the given slug and update it as the active
      // enterprise customer for the learner.
      const foundEnterpriseCustomerForSlug = allLinkedEnterpriseCustomerUsers.find(
        enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
      );
      if (foundEnterpriseCustomerForSlug) {
        await updateUserActiveEnterprise({
          enterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
        });
        queryClient.setQueryData(linkedEnterpriseCustomersQuery.queryKey, {
          ...enterpriseLearnerData,
          activeEnterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
          allLinkedEnterpriseCustomerUsers: allLinkedEnterpriseCustomerUsers.map(
            ecu => ({
              ...ecu,
              active: (
                ecu.enterpriseCustomer.uuid === foundEnterpriseCustomerForSlug.enterpriseCustomer.uuid
              ),
            }),
          ),
        });
        await Promise.all(getEnterpriseAppData({
          enterpriseCustomer: foundEnterpriseCustomerForSlug.enterpriseCustomer,
          userId,
          userEmail,
          queryClient,
        }));
        return null;
      }

      return redirect(generatePath('/:enterpriseSlug/*', {
        enterpriseSlug: activeEnterpriseCustomer.slug,
        '*': requestUrl.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
      }));
    }

    return null;
  };
}
