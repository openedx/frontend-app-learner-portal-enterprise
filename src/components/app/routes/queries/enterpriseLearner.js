import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';

/**
 * Recursive function to fetch all linked enterprise customer users, traversing paginated results.
 * @param {string} url Request URL
 * @param {Array} [linkedEnterprises] Array of linked enterprise customer users
 * @returns Array of all linked enterprise customer users for authenticated user.
 */
async function fetchData(url, linkedEnterprises = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const linkedEnterprisesCopy = [...linkedEnterprises];
  linkedEnterprisesCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchData(responseData.next, linkedEnterprisesCopy);
  }
  return linkedEnterprisesCopy;
}

/**
 * Fetches the enterprise learner data for the authenticated user, including all
 * linked enterprise customer users.
 *
 * @param {string} username The username of the authenticated user.
 * @param {string} enterpriseSlug The slug of the enterprise customer to display.
 * @param {Object} [options] Additional query options.
 * @returns
 */
export const fetchEnterpriseLearnerData = async (username, enterpriseSlug, options = {}) => {
  const config = getConfig();
  const enterpriseLearnerUrl = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    username,
    ...options,
    page: 1,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  const linkedEnterpriseCustomersUsers = await fetchData(url);
  const activeLinkedEnterpriseCustomerUser = linkedEnterpriseCustomersUsers.find(enterprise => enterprise.active);
  const activeEnterpriseCustomer = activeLinkedEnterpriseCustomerUser?.enterpriseCustomer;
  const activeEnterpriseCustomerUserRoleAssignments = activeLinkedEnterpriseCustomerUser?.roleAssignments;

  // Find enterprise customer metadata for the currently viewed
  // enterprise slug in the page route params.
  const foundEnterpriseCustomerUserForCurrentSlug = linkedEnterpriseCustomersUsers.find(
    enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  );

  const determineEnterpriseCustomerUserForDisplay = () => {
    const activeEnterpriseCustomerUser = {
      enterpriseCustomer: activeEnterpriseCustomer,
      roleAssignments: activeEnterpriseCustomerUserRoleAssignments,
    };
    if (!enterpriseSlug) {
      return activeEnterpriseCustomerUser;
    }
    if (enterpriseSlug !== activeEnterpriseCustomer.slug && foundEnterpriseCustomerUserForCurrentSlug) {
      return {
        enterpriseCustomer: foundEnterpriseCustomerUserForCurrentSlug.enterpriseCustomer,
        roleAssignments: foundEnterpriseCustomerUserForCurrentSlug.roleAssignments,
      };
    }
    return activeEnterpriseCustomerUser;
  };

  const {
    enterpriseCustomer,
    roleAssignments,
  } = determineEnterpriseCustomerUserForDisplay();
  return {
    enterpriseCustomer,
    enterpriseCustomerUserRoleAssignments: roleAssignments,
    activeEnterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments,
    allLinkedEnterpriseCustomerUsers: linkedEnterpriseCustomersUsers,
  };
};

/**
 * Creates a query object to fetch the enterprise learner data for the authenticated user.
 * @param {string} username The username of the authenticated user.
 * @param {string} enterpriseSlug The slug of the enterprise customer to display.
 * @returns {Object} The query object for fetching the enterprise learner data.
 */
// export default function makeEnterpriseLearnerQuery(username, enterpriseSlug) {
//   return {
//     queryKey: enterpriseQueryKeys.enterpriseLearner(username, enterpriseSlug),
//     queryFn: async () => fetchEnterpriseLearnerData(username, enterpriseSlug),
//   };
// }
