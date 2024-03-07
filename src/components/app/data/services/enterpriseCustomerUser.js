import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { determineEnterpriseCustomerUserForDisplay, transformEnterpriseCustomer } from '../utils';
import { fetchPaginatedData } from './utils';

/**
 * Helper function to `updateActiveEnterpriseCustomerUser` to make the POST API
 * request, updating the active enterprise customer for the learner.
 * @param {Object} params - The parameters object.
 * @param {Object} params.enterpriseCustomer - The enterprise customer that should be made active.
 * @returns {Promise} - A promise that resolves when the active enterprise customer is updated.
 */
export async function updateUserActiveEnterprise({ enterpriseCustomer }) {
  const url = `${getConfig().LMS_BASE_URL}/enterprise/select/active/`;
  const formData = new FormData();
  formData.append('enterprise', enterpriseCustomer.uuid);
  return getAuthenticatedHttpClient().post(url, formData);
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
export async function fetchEnterpriseLearnerData(username, enterpriseSlug, options = {}) {
  const config = getConfig();
  const enterpriseLearnerUrl = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    username,
    ...options,
    page: 1,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  const {
    results: enterpriseCustomersUsers,
    response: enterpriseCustomerUsersResponse,
  } = await fetchPaginatedData(url);
  const { enterpriseFeatures } = enterpriseCustomerUsersResponse;

  // Transform enterprise customer user results
  const transformedEnterpriseCustomersUsers = enterpriseCustomersUsers.map(
    enterpriseCustomerUser => ({
      ...enterpriseCustomerUser,
      enterpriseCustomer: transformEnterpriseCustomer(enterpriseCustomerUser.enterpriseCustomer),
    }),
  );

  const activeLinkedEnterpriseCustomerUser = transformedEnterpriseCustomersUsers.find(enterprise => enterprise.active);
  const activeEnterpriseCustomer = activeLinkedEnterpriseCustomerUser?.enterpriseCustomer;
  const activeEnterpriseCustomerUserRoleAssignments = activeLinkedEnterpriseCustomerUser?.roleAssignments;

  // Find enterprise customer metadata for the currently viewed
  // enterprise slug in the page route params.
  const foundEnterpriseCustomerUserForCurrentSlug = transformedEnterpriseCustomersUsers.find(
    enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer?.slug === enterpriseSlug,
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
    enterpriseCustomer,
    enterpriseCustomerUserRoleAssignments: roleAssignments,
    activeEnterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments,
    allLinkedEnterpriseCustomerUsers: transformedEnterpriseCustomersUsers,
    enterpriseFeatures,
  };
}

/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export async function fetchEnterpriseCourseEnrollments(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_id: enterpriseId,
    ...options,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}
