import dayjs from 'dayjs';
import { generatePath, matchPath, redirect } from 'react-router-dom';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  ENTERPRISE_OFFER_STATUS,
  ENTERPRISE_OFFER_USAGE_TYPE,
} from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { getErrorResponseStatusCode } from '../../../utils/common';
import { SUBSIDY_REQUEST_STATE } from '../../enterprise-subsidy-requests';
import {
  determineEnterpriseCustomerUserForDisplay,
  getAssignmentsByState,
  transformEnterpriseCustomer,
  transformRedeemablePoliciesData,
} from './utils';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { features } from '../../../config';

// Enterprise Course Enrollments

/**
 * TODO
 * @returns
 */
export async function fetchUserEntitlements() {
  const url = `${getConfig().LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

// Enterprise Learner

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
 * Recursive function to fetch all results, traversing a paginated API response.
 * @param {string} url Request URL
 * @param {Array} [results] Array of results.
 * @returns Array of all results for authenticated user.
 */
async function fetchPaginatedData(url, results = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const resultsCopy = [...results];
  resultsCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchPaginatedData(responseData.next, resultsCopy);
  }
  return {
    results: resultsCopy,
    response: responseData,
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
    enterpriseCustomer,
    enterpriseCustomerUserRoleAssignments: roleAssignments,
    activeEnterpriseCustomer,
    activeEnterpriseCustomerUserRoleAssignments,
    allLinkedEnterpriseCustomerUsers: transformedEnterpriseCustomersUsers,
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

// Course

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
 * @param {*} activationKey
 * @returns
 */
export async function activateLicense(activationKey) {
  const queryParams = new URLSearchParams({ activation_key: activationKey });
  const url = `${getConfig().LICENSE_MANAGER_URL}/api/v1/license-activation/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().post(url);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function activateSubscriptionLicense({
  enterpriseCustomer,
  subscriptionLicenseToActivate,
  requestUrl,
}) {
  const licenseActivationRouteMatch = matchPath('/:enterpriseSlug/licenses/:activationKey/activate', requestUrl.pathname);
  const dashboardRedirectPath = generatePath('/:enterpriseSlug', { enterpriseSlug: enterpriseCustomer.slug });
  try {
    // Activate the user's assigned subscription license.
    await activateLicense(subscriptionLicenseToActivate.activationKey);
    const autoActivatedSubscriptionLicense = {
      ...subscriptionLicenseToActivate,
      status: 'activated',
      activationDate: dayjs().toISOString(),
    };
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.license-activation.license-activated',
      {
        // `autoActivated` is true if the user is on a page route *other* than the license activation route.
        autoActivated: !licenseActivationRouteMatch,
      },
    );
    // If user is on the license activation route, redirect to the dashboard.
    if (licenseActivationRouteMatch) {
      throw redirect(dashboardRedirectPath);
    }
    // Otherwise, return the now-activated subscription license.
    return autoActivatedSubscriptionLicense;
  } catch (error) {
    logError(error);
    if (licenseActivationRouteMatch) {
      throw redirect(dashboardRedirectPath);
    }
    return null;
  }
}

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

/**
 * TODO
 * @param {*} param0
 */
export async function getAutoAppliedSubscriptionLicense({
  enterpriseCustomer,
  customerAgreement,
}) {
  // If the feature flag for auto-applied licenses is not enabled, return early.
  if (!features.ENABLE_AUTO_APPLIED_LICENSES) {
    return null;
  }

  const hasSubscriptionForAutoAppliedLicenses = !!customerAgreement.subscriptionForAutoAppliedLicenses;
  const hasIdentityProvider = enterpriseCustomer.identityProvider;

  // If customer agreement has no configured subscription plan for auto-applied
  // licenses, or the enterprise customer does not have an identity provider,
  // return early.
  if (!hasSubscriptionForAutoAppliedLicenses || !hasIdentityProvider) {
    return null;
  }

  try {
    return requestAutoAppliedUserLicense(customerAgreement.uuid);
  } catch (error) {
    logError(error);
    return null;
  }
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function activateOrAutoApplySubscriptionLicense({
  enterpriseCustomer,
  subscriptionsData,
  requestUrl,
}) {
  const {
    customerAgreement,
    licensesByStatus,
  } = subscriptionsData;
  if (!customerAgreement || customerAgreement.netDaysUntilExpiration <= 0) {
    return null;
  }

  // Check if learner already has activated license. If so, return early.
  const hasActivatedSubscriptionLicense = licensesByStatus[LICENSE_STATUS.ACTIVATED].length > 0;
  if (hasActivatedSubscriptionLicense) {
    return null;
  }

  // Otherwise, check if there is an assigned subscription
  // license to activate OR if the user should request an
  // auto-applied subscription license.
  const subscriptionLicenseToActivate = licensesByStatus[LICENSE_STATUS.ASSIGNED][0];
  if (subscriptionLicenseToActivate) {
    return activateSubscriptionLicense({
      enterpriseCustomer,
      subscriptionLicenseToActivate,
      requestUrl,
    });
  }

  const hasRevokedSubscriptionLicense = licensesByStatus[LICENSE_STATUS.REVOKED].length > 0;
  if (!hasRevokedSubscriptionLicense) {
    return getAutoAppliedSubscriptionLicense({
      enterpriseCustomer,
      customerAgreement,
    });
  }

  return null;
}

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
  const {
    customerAgreement,
    results: subscriptionLicenses,
  } = camelCaseObject(response.data);
  const licensesByStatus = {
    [LICENSE_STATUS.ACTIVATED]: [],
    [LICENSE_STATUS.ASSIGNED]: [],
    [LICENSE_STATUS.REVOKED]: [],
  };
  const subscriptionsData = {
    subscriptionLicenses,
    customerAgreement,
    subscriptionLicense: null,
    licensesByStatus,
  };
  /**
   * Ordering of these status keys (i.e., activated, assigned, revoked) is important as the first
   * license found when iterating through each status key in this order will be selected as the
   * applicable license for use by the rest of the application.
   *
   * Example: an activated license will be chosen as the applicable license because activated licenses
   * come first in ``licensesByStatus`` even if the user also has a revoked license.
   */
  subscriptionLicenses.forEach((license) => {
    const { subscriptionPlan, status } = license;
    const { isActive, daysUntilExpiration } = subscriptionPlan;
    const isCurrent = daysUntilExpiration > 0;
    const isUnassignedLicense = status === LICENSE_STATUS.UNASSIGNED;
    if (isUnassignedLicense || !isCurrent || !isActive) {
      return;
    }
    licensesByStatus[license.status].push(license);
  });
  const applicableSubscriptionLicense = Object.values(licensesByStatus).flat()[0];
  subscriptionsData.subscriptionLicense = applicableSubscriptionLicense;
  subscriptionsData.licensesByStatus = licensesByStatus;

  return subscriptionsData;
}

// Notices
export const fetchNotices = async () => {
  const url = `${getConfig().LMS_BASE_URL}/notices/api/v1/unacknowledged`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    const results = response?.data.results || [];
    if (results.length === 0 || !results[0]) {
      return null;
    }
    return `${results[0]}?next=${window.location.href}`;
  } catch (error) {
    // we will just swallow error, as that probably means the notices app is not installed.
    // Notices are not necessary for the rest of dashboard to function.
    const httpErrorStatus = getErrorResponseStatusCode(error);
    if (httpErrorStatus === 404) {
      logInfo(`${error}. This probably happened because the notices plugin is not installed on platform.`);
    } else {
      logError(error);
    }
    return null;
  }
};
