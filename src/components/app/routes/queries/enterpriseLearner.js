import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getBrandColorsFromCSSVariables } from '../../../../utils/common';

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
  return {
    results: linkedEnterprisesCopy,
    enterpriseFeatures: responseData.enterpriseFeatures,
  };
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
function determineEnterpriseCustomerUserForDisplay({
  activeEnterpriseCustomer,
  activeEnterpriseCustomerUserRoleAssignments,
  enterpriseSlug,
  foundEnterpriseCustomerUserForCurrentSlug,
}) {
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
}

/**
 * TODO
 * @param {Object} enterpriseCustomer
 * @param {Object} enterpriseFeatures
 * @returns
 */
function transformEnterpriseCustomer(enterpriseCustomer, enterpriseFeatures) {
  // If the learner portal is not enabled for the displayed enterprise customer, return null. This
  // results in the enterprise learner portal not being accessible for the user, showing a 404 page.
  if (!enterpriseCustomer.enableLearnerPortal) {
    return null;
  }

  // Otherwise, learner portal is enabled, so transform the enterprise customer data.
  const disableSearch = !!(
    !enterpriseCustomer.enableIntegratedCustomerLearnerPortalSearch
    && enterpriseCustomer.identityProvider
  );
  const showIntegrationWarning = !!(!disableSearch && enterpriseCustomer.identityProvider);
  const brandColors = getBrandColorsFromCSSVariables();
  const defaultPrimaryColor = brandColors.primary;
  const defaultSecondaryColor = brandColors.info100;
  const defaultTertiaryColor = brandColors.info500;
  const {
    primaryColor,
    secondaryColor,
    tertiaryColor,
  } = enterpriseCustomer?.brandingConfiguration || {};

  return {
    ...enterpriseCustomer,
    brandingConfiguration: {
      ...enterpriseCustomer.brandingConfiguration,
      primaryColor: primaryColor || defaultPrimaryColor,
      secondaryColor: secondaryColor || defaultSecondaryColor,
      tertiaryColor: tertiaryColor || defaultTertiaryColor,
    },
    disableSearch,
    showIntegrationWarning,
    enterpriseFeatures,
  };
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
const fetchEnterpriseLearnerData = async (username, enterpriseSlug, options = {}) => {
  const config = getConfig();
  const enterpriseLearnerUrl = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    username,
    ...options,
    page: 1,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  const {
    results: linkedEnterpriseCustomersUsers,
    enterpriseFeatures,
  } = await fetchData(url);
  const activeLinkedEnterpriseCustomerUser = linkedEnterpriseCustomersUsers.find(enterprise => enterprise.active);
  const activeEnterpriseCustomer = activeLinkedEnterpriseCustomerUser?.enterpriseCustomer;
  const activeEnterpriseCustomerUserRoleAssignments = activeLinkedEnterpriseCustomerUser?.roleAssignments;

  // Find enterprise customer metadata for the currently viewed
  // enterprise slug in the page route params.
  const foundEnterpriseCustomerUserForCurrentSlug = linkedEnterpriseCustomersUsers.find(
    enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  );

  const {
    enterpriseCustomer,
    roleAssignments,
  } = determineEnterpriseCustomerUserForDisplay({
    activeEnterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments,
    enterpriseSlug,
    foundEnterpriseCustomerUserForCurrentSlug,
  });

  return {
    enterpriseCustomer: transformEnterpriseCustomer(enterpriseCustomer, enterpriseFeatures),
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
export default function makeEnterpriseLearnerQuery(username, enterpriseSlug) {
  return {
    queryKey: ['enterprise', 'linked-enterprise-customer-users', username, enterpriseSlug],
    queryFn: async () => fetchEnterpriseLearnerData(username, enterpriseSlug),
  };
}
