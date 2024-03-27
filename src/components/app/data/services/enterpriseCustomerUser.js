import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { determineEnterpriseCustomerUserForDisplay, transformEnterpriseCustomer } from '../utils';
import { fetchPaginatedData } from './utils';
import { getErrorResponseStatusCode } from '../../../../utils/common';

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
 * TODO
 * @param {*} inviteKeyUUID
 * @returns
 */
export async function postLinkEnterpriseLearner(inviteKeyUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/enterprise/api/v1/enterprise-customer-invite-key/${inviteKeyUUID}/link-user/`;
  const response = await getAuthenticatedHttpClient().post(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 */
export async function fetchEnterpriseCustomerForSlug(enterpriseSlug) {
  const queryParams = new URLSearchParams({ slug: enterpriseSlug });
  const url = `${getConfig().LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const { results } = camelCaseObject(response.data);
    return results[0] ?? null;
  } catch (error) {
    logError(error);
    return null;
  }
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
  const enterpriseLearnerUrl = `${getConfig().LMS_BASE_URL}/enterprise/api/v1/enterprise-learner/`;
  const queryParams = new URLSearchParams({
    username,
    page: 1,
    ...options,
  });
  const url = `${enterpriseLearnerUrl}?${queryParams.toString()}`;
  try {
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

    const activeLinkedEnterpriseCustomerUser = transformedEnterpriseCustomersUsers.find(
      enterprise => enterprise.active,
    );
    const activeEnterpriseCustomer = activeLinkedEnterpriseCustomerUser?.enterpriseCustomer;
    const activeEnterpriseCustomerUserRoleAssignments = activeLinkedEnterpriseCustomerUser?.roleAssignments || [];

    // Find enterprise customer metadata for the currently viewed
    // enterprise slug in the page route params.
    const foundEnterpriseCustomerUserForCurrentSlug = transformedEnterpriseCustomersUsers.find(
      enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer?.slug === enterpriseSlug,
    );

    // If no enterprise customer is found (i.e., authenticated user not explicitly
    // linked), but the authenticated user is staff, attempt to retrieve enterprise
    // customer metadata from the `/enterprise-customer` LMS API.
    let staffEnterpriseCustomer;
    if (getAuthenticatedUser().administrator && enterpriseSlug && !foundEnterpriseCustomerUserForCurrentSlug) {
      const originalStaffEnterpriseCustomer = await fetchEnterpriseCustomerForSlug(enterpriseSlug);
      if (originalStaffEnterpriseCustomer) {
        staffEnterpriseCustomer = transformEnterpriseCustomer(originalStaffEnterpriseCustomer);
      }
    }

    const {
      enterpriseCustomer,
      roleAssignments,
    } = determineEnterpriseCustomerUserForDisplay({
      activeEnterpriseCustomer,
      activeEnterpriseCustomerUserRoleAssignments,
      enterpriseSlug,
      foundEnterpriseCustomerUserForCurrentSlug,
      staffEnterpriseCustomer,
    });
    return {
      enterpriseCustomer,
      enterpriseCustomerUserRoleAssignments: roleAssignments,
      activeEnterpriseCustomer,
      activeEnterpriseCustomerUserRoleAssignments,
      allLinkedEnterpriseCustomerUsers: transformedEnterpriseCustomersUsers,
      enterpriseFeatures,
      staffEnterpriseCustomer,
    };
  } catch (error) {
    logError(error);
    return {
      enterpriseCustomer: null,
      enterpriseCustomerUserRoleAssignments: [],
      activeEnterpriseCustomer: null,
      activeEnterpriseCustomerUserRoleAssignments: [],
      allLinkedEnterpriseCustomerUsers: [],
      enterpriseFeatures: {},
      staffEnterpriseCustomer: null,
    };
  }
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
    is_active: true,
    ...options,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    if (getErrorResponseStatusCode(error) !== 404) {
      logError(error);
    }
    return [];
  }
}

/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchLearnerProgramsList(enterpriseUUID) {
  const url = `${getConfig().LMS_BASE_URL}/api/dashboard/v0/programs/${enterpriseUUID}/`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return [];
  }
}

/**
 * Fetches in-progress pathways for the authenticated user. Note, it should be
 * filtered based on the enterpriseUUID, but is not currently.
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchInProgressPathways(enterpriseUUID) { // eslint-disable-line no-unused-vars
  // TODO: after adding support of filtering on enterprise UUID, send the uuid to endpoint as well
  const url = `${getConfig().LMS_BASE_URL}/api/learner-pathway-progress/v1/progress/`;
  try {
    const { results } = await fetchPaginatedData(url);
    return results;
  } catch (error) {
    logError(error);
    return [];
  }
}
