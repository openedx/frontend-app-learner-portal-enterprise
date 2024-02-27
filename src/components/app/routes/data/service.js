import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { ensureEnterpriseAppData } from '../queries';

/**
 * Helper function to `updateActiveEnterpriseCustomerUser` to make the POST API
 * request, updating the active enterprise customer for the learner.
 * @param {Object} params - The parameters object.
 * @param {Object} params.enterpriseCustomer - The enterprise customer that should be made active.
 * @returns {Promise} - A promise that resolves when the active enterprise customer is updated.
 */
export const updateUserActiveEnterprise = async ({ enterpriseCustomer }) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/select/active/`;
  const formData = new FormData();
  formData.append('enterprise', enterpriseCustomer.uuid);
  return getAuthenticatedHttpClient().post(url, formData);
};

/**
 * Updates the active enterprise customer for the learner.
 * @param {Object} params - The parameters object.
 * @param {Object} params.enterpriseCustomerUser - The enterprise customer user.
 * @param {Object} params.enterpriseLearnerData - The enterprise learner data.
 * @param {Object[]} params.allLinkedEnterpriseCustomerUsers - All linked enterprise customer users.
 * @param {string} params.userId - The user ID.
 * @param {string} params.userEmail - The user email.
 * @param {Object} params.queryClient - The query client.
 * @returns {Promise<void>} - A promise that resolves when the active enterprise customer is updated
 *  and the query cache is updated with fresh data.
 */
export async function updateActiveEnterpriseCustomerUser({
  enterpriseCustomerUser,
  enterpriseLearnerData,
  allLinkedEnterpriseCustomerUsers,
  userId,
  userEmail,
  queryClient,
}) {
  // Makes the POST API request to update the active enterprise customer
  // for the learner in the backend for future sessions.
  await updateUserActiveEnterprise({
    enterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
  });
  // Perform optimistic update of the query cache to avoid duplicate API request for the same data. The only
  // difference is that the query key now contains the new enterprise slug, so we can proactively set the query
  // cache for with the enterprise learner data we already have before resolving the loader.
  queryClient.setQueryData(enterpriseCustomerUser.queryKey, {
    ...enterpriseLearnerData,
    activeEnterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
    allLinkedEnterpriseCustomerUsers: allLinkedEnterpriseCustomerUsers.map(
      ecu => ({
        ...ecu,
        active: (
          ecu.enterpriseCustomer.uuid === enterpriseCustomerUser.enterpriseCustomer.uuid
        ),
      }),
    ),
  });
  // Refetch all enterprise app data for the new active enterprise customer.
  await Promise.all(ensureEnterpriseAppData({
    enterpriseCustomer: enterpriseCustomerUser.enterpriseCustomer,
    userId,
    userEmail,
    queryClient,
  }));
}
