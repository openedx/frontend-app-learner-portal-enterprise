import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import {
  ENTERPRISE_OFFER_STATUS,
  ENTERPRISE_OFFER_USAGE_TYPE,
} from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { getErrorResponseStatusCode } from '../../../../utils/common';
import { SUBSIDY_REQUEST_STATE } from '../../../enterprise-subsidy-requests';
import {
  determineEnterpriseCustomerUserForDisplay,
  getAssignmentsByState,
  transformEnterpriseCustomer,
  transformRedeemablePoliciesData,
} from './utils';

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
  return {
    results: linkedEnterprisesCopy,
    enterpriseFeatures: responseData.enterpriseFeatures,
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
    activeEnterpriseCustomer: transformEnterpriseCustomer(activeEnterpriseCustomer, enterpriseFeatures),
    activeEnterpriseCustomerUserRoleAssignments,
    allLinkedEnterpriseCustomerUsers: linkedEnterpriseCustomersUsers,
    enterpriseFeatures,
  };
}

// Course Enrollments
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

// Course Metadata
/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchCourseMetadata(enterpriseId, courseKey, options = {}) {
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
}

// Content Highlights
/**
 * Content Highlights Configuration
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchEnterpriseCuration(enterpriseUUID, options = {}) {
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
}

// Can Redeem
/**
 * Service method to determine whether the authenticated user can redeem the specified course run(s).
 *
 * @param {object} args
 * @param {array} courseRunKeys List of course run keys.
 * @returns Promise for get request from the authenticated http client.
 */
export async function fetchCanRedeem(enterpriseId, courseRunKeys) {
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
}

// Subsidies

// Browse and Request
/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchBrowseAndRequestConfiguration(enterpriseUUID) {
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
}

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userEmail
 * @param {*} state
 * @returns
 */
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

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userEmail
 * @param {*} state
 * @returns
 */
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
  const responseData = camelCaseObject(response.data);
  const redeemablePolicies = transformRedeemablePoliciesData(responseData);
  const learnerContentAssignments = getAssignmentsByState(
    redeemablePolicies?.flatMap(item => item.learnerContentAssignments || []),
  );
  return {
    redeemablePolicies,
    learnerContentAssignments,
  };
}

// Subscriptions
/**
 * TODO
 * @returns
 * @param enterpriseUUID
 */
export async function fetchSubscriptions(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  // Extracts customer agreement and removes it from the original response object
  const { customerAgreement } = responseData;
  const subscriptionsData = {
    subscriptionLicenses: responseData.results,
    customerAgreement,
  };
  return subscriptionsData;
}

/**
 * TODO
 * @param {*} activationKey
 * @returns
 */
export async function activateLicense(activationKey) {
  const queryParams = new URLSearchParams({ activation_key: activationKey });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/license-activation/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().post(url);
}

// Notices
export const fetchNotices = async () => {
  const url = `${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    if (data?.results.length > 0) {
      const { results } = data;
      window.location.assign(`${results[0]}?next=${window.location.href}`);
      throw new Error('Redirecting to notice');
    }
    return data;
  } catch (error) {
    // we will just swallow error, as that probably means the notices app is not installed.
    // Notices are not necessary for the rest of dashboard to function.
    const httpErrorStatus = getErrorResponseStatusCode(error);
    if (httpErrorStatus === 404) {
      logInfo(`${error}. This probably happened because the notices plugin is not installed on platform.`);
    } else {
      logError(error);
    }
  }
  return null;
};

/**
 * Attempts to auto-apply a license for the authenticated user and the specified customer agreement.
 *
 * @param {string} customerAgreementId The UUID of the customer agreement.
 * @returns An object representing the auto-applied license or null if no license was auto-applied.
 */
export async function requestAutoAppliedUserLicense(customerAgreementId) {
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/customer-agreement/${customerAgreementId}/auto-apply/`;
  const response = await getAuthenticatedHttpClient().post(url);
  return camelCaseObject(response.data);
}

// Notices
export const fetchNotices = async () => {
  const url = `${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`;
  try {
    const { data } = await getAuthenticatedHttpClient().get(url);
    if (data?.results.length > 0) {
      const { results } = data;
      window.location.assign(`${results[0]}?next=${window.location.href}`);
      throw new Error('Redirecting to notice');
    }
    return data;
  } catch (error) {
    // we will just swallow error, as that probably means the notices app is not installed.
    // Notices are not necessary for the rest of dashboard to function.
    const httpErrorStatus = getErrorResponseStatusCode(error);
    if (httpErrorStatus === 404) {
      logInfo(`${error}. This probably happened because the notices plugin is not installed on platform.`);
    } else {
      logError(error);
    }
  }
  return null;
};

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
