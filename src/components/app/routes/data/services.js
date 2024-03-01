import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  ENTERPRISE_OFFER_STATUS,
  ENTERPRISE_OFFER_USAGE_TYPE,
} from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { getErrorResponseStatusCode } from '../../../../utils/common';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests';

// Enterprise Course Enrollments
export async function fetchUserEntitlements() {
  const url = `${getConfig().LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

// Enterprise Learner
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

// Course Enrollments
/**
 * TODO
 * @param {*} enterpriseId
 * @param {*} options
 * @returns
 */
export const fetchEnterpriseCourseEnrollments = async (enterpriseId, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_id: enterpriseId,
    ...options,
  });
  const url = `${getConfig().LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
};

// Course Metadata
/**
 * TODO
 * @param {*} param0
 * @returns
 */
export const fetchCourseMetadata = async (enterpriseId, courseKey, options = {}) => {
  const contentMetadataUrl = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseId}/content-metadata/${courseKey}/`;
  const queryParams = new URLSearchParams({
    ...options,
  });
  const url = `${contentMetadataUrl}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

// Content Highlights
/**
 * Content Highlights Configuration
 * @param {*} enterpriseUUID
 * @returns
 */
export const fetchEnterpriseCuration = async (enterpriseUUID, options = {}) => {
  const queryParams = new URLSearchParams({
    enterprise_customer: enterpriseUUID,
    ...options,
  });
  const url = `${getConfig().ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-curations/?${queryParams.toString()}`;

  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const data = camelCaseObject(response.data);
    // Return first result, given that there should only be one result, if any.
    return data.results[0] ?? null;
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

// Can Redeem
/**
 * Service method to determine whether the authenticated user can redeem the specified course run(s).
 *
 * @param {object} args
 * @param {array} courseRunKeys List of course run keys.
 * @returns Promise for get request from the authenticated http client.
 */
export const fetchCanRedeem = async (enterpriseId, courseRunKeys) => {
  const queryParams = new URLSearchParams();
  courseRunKeys.forEach((courseRunKey) => {
    queryParams.append('content_key', courseRunKey);
  });
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${enterpriseId}/can-redeem/`;
  const urlWithParams = `${url}?${queryParams.toString()}`;
  try {
    const response = await getAuthenticatedHttpClient().get(urlWithParams);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return [];
    }
    throw error;
  }
};

// Subsidies

// Browse and Request
/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
export const fetchBrowseAndRequestConfiguration = async (enterpriseUUID) => {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

export async function fetchLicenseRequests(
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

export async function fetchCouponCodeRequests(
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

// Coupon Codes
async function fetchCouponCodeAssignments(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    enterprise_uuid: enterpriseId,
    full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
    is_active: 'True',
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/offer_assignment_summary/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

async function fetchCouponsOverview(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    page: 1,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/coupons/${enterpriseId}/overview/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchCouponCodes(enterpriseUuid) {
  const results = await Promise.all([
    fetchCouponsOverview(enterpriseUuid),
    fetchCouponCodeAssignments(enterpriseUuid),
  ]);
  return {
    couponsOverview: results[0],
    couponCodeAssignments: results[1],
  };
}

// Enterprise Offers
export async function fetchEnterpriseOffers(enterpriseId, options = {}) {
  const queryParams = new URLSearchParams({
    usage_type: ENTERPRISE_OFFER_USAGE_TYPE.PERCENTAGE,
    discount_value: 100,
    status: ENTERPRISE_OFFER_STATUS.OPEN,
    page_size: 100,
    ...options,
  });
  const config = getConfig();
  const url = `${config.ECOMMERCE_BASE_URL}/api/v2/enterprise/${enterpriseId}/enterprise-learner-offers/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

// Policies
/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userID
 * @returns
 */
export async function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

// Subscriptions
async function fetchSubscriptionLicensesForUser(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @returns
 * @param enterpriseUuid
 */
export async function fetchSubscriptions(enterpriseUuid) {
  const response = await fetchSubscriptionLicensesForUser(enterpriseUuid);
  // Extracts customer agreement and removes it from the original response object
  const { customerAgreement } = response;
  return {
    subscriptionLicenses: response.results,
    customerAgreement,
  };
}
