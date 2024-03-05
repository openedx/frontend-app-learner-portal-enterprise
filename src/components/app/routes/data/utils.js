import { generatePath, matchPath, redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import {
  AxiosJwtAuthService,
  configure as configureAuth,
  fetchAuthenticatedUser,
  getLoginRedirectUrl,
} from '@edx/frontend-platform/auth';
import {
  configure as configureLogging,
  getLoggingService,
  logError,
  NewRelicLoggingService,
} from '@edx/frontend-platform/logging';
import { getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import Cookies from 'universal-cookie';

import { getBrandColorsFromCSSVariables } from '../../../../utils/common';
import { ASSIGNMENT_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';

/**
 * Determines whether the user is visiting the dashboard for the first time.
 * @param {URL} requestUrl - The request URL.
 * @returns {boolean} - Whether the user is visiting the dashboard for the first time.
 */
function isFirstDashboardPageVisit(requestUrl) {
  // Check whether the request URL matches the dashboard page route. If not, return early.
  const isDashboardRoute = matchPath('/:enterpriseSlug', requestUrl.pathname);
  if (!isDashboardRoute) {
    return false;
  }

  // User is visiting the dashboard for the first time if the 'has-user-visited-learner-dashboard'
  // localStorage item is not set.
  const hasUserVisitedDashboard = localStorage.getItem('has-user-visited-learner-dashboard');
  return !hasUserVisitedDashboard;
}

/**
 * Determines whether to redirect to the search page for new, first-time
 * visitors, who do not have any displayed assignments. The redirect occurs
 * only based on the presence of localStorage data, which is set on the first
 * visit to the learner portal. The redirect does not occur if the user has
 * already visited the learner portal.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.enterpriseSlug - The enterprise slug.
 * @param {Object} params.enterpriseAppData - The enterprise app data.
 * @param {URL} params.requestUrl - The request URL.
 */
export function redirectToSearchPageForNewUser({ enterpriseSlug, enterpriseAppData, requestUrl }) {
  const isFirstDashboardVisit = isFirstDashboardPageVisit(requestUrl);
  if (!isFirstDashboardVisit) {
    return;
  }

  // Set the localStorage item to indicate that the user has visited the learner dashboard.
  localStorage.setItem('has-user-visited-learner-dashboard', true);

  // Check whether the user has any assignments for display. If not, redirect to the search page.
  const redeemablePolicies = enterpriseAppData[1];
  const { hasAssignmentsForDisplay } = redeemablePolicies.learnerContentAssignments;
  if (!hasAssignmentsForDisplay) {
    throw redirect(generatePath('/:enterpriseSlug/search', { enterpriseSlug }));
  }
}

/**
 * Redirects to the same URL without a trailing slash.
 * @param {URL} requestUrl - The request URL.
 * @returns {void} - Throws a redirect if the URL has a trailing
 *  slash to remove trailing slash.
 */
export function redirectToRemoveTrailingSlash(requestUrl) {
  if (!requestUrl.pathname.endsWith('/')) {
    return;
  }
  throw redirect(requestUrl.pathname.slice(0, -1));
}

/**
 * Ensures that the user is authenticated. If not, redirects to the login page.
 * @param {URL} requestUrl - The current request URL to redirect back to if the
 *  user is not authenticated.
 */
export async function ensureAuthenticatedUser(requestUrl, params) {
  configureLogging(NewRelicLoggingService, {
    config: getConfig(),
  });
  configureAuth(AxiosJwtAuthService, {
    loggingService: getLoggingService(),
    config: getConfig(),
  });

  const {
    enterpriseSlug,
    enterpriseCustomerInviteKey,
  } = params;
  let authenticatedUser = await fetchAuthenticatedUser();

  // User is not authenticated. Redirect to the login page.
  if (!authenticatedUser) {
    // Remove cookie that controls whether the user will see the integration warning
    // modal on their next visit. The expected behavior is to only see the modal once
    // per authenticated session.
    const cookies = new Cookies();
    cookies.remove(getConfig().INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);

    // Check whether to redirect to logistration or show the logout message for IDP customers. If
    // the request URL contains the `?logout=true` query parameter, show the logout message and do
    // not redirect to logistration. This is to avoid the redirect back to the enterprise customer's
    // IDP which brings the user right back in, disallowing a proper logout.
    const queryParams = new URLSearchParams(requestUrl.search);
    if (queryParams.get('logout')) {
      return null;
    }
    let redirectUrl = getLoginRedirectUrl(requestUrl.href);
    if (enterpriseSlug) {
      redirectUrl = getProxyLoginUrl(enterpriseSlug, enterpriseCustomerInviteKey);
    }
    throw redirect(redirectUrl);
  }

  // User is authenticated so return the authenticated user, but after calling `login_refresh`
  // to ensure that the user's session is refreshed if it contains 0 roles in the JWT, an unexpected
  // case given enterprise users should have at least one role.
  const userRoles = authenticatedUser.roles;
  if (!userRoles || userRoles.length === 0) {
    authenticatedUser = await fetchAuthenticatedUser({
      forceRefresh: true,
    });
  }

  return authenticatedUser;
}

/**
 * Helper function to determine which linked enterprise customer user record
 * should be used for display in the UI.
 * @param {*} param0
 * @returns
 */
export function determineEnterpriseCustomerUserForDisplay({
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
 * Transform enterprise customer metadata for use by consuming UI components.
 * @param {Object} enterpriseCustomer
 * @param {Object} enterpriseFeatures
 * @returns
 */
export function transformEnterpriseCustomer(enterpriseCustomer, enterpriseFeatures) {
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
  } = enterpriseCustomer.brandingConfiguration || {};

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
 * Transforms the redeemable policies data by attaching the subsidy expiration date
 * to each assignment within the policies, if available.
 * @param {object[]} [policies] - Array of policy objects containing learner assignments.
 * @returns {object} - Returns modified policies data with subsidy expiration dates attached to assignments.
 */
export function transformRedeemablePoliciesData(policies = []) {
  return policies.map((policy) => {
    const assignmentsWithSubsidyExpiration = policy.learnerContentAssignments?.map(assignment => ({
      ...assignment,
      subsidyExpirationDate: policy.subsidyExpirationDate,
    }));
    return {
      ...policy,
      learnerContentAssignments: assignmentsWithSubsidyExpiration,
    };
  });
}

/**
 * Takes a flattened array of assignments and returns an object containing
 * lists of assignments for each assignment state.
 *
 * @param {Array} assignments - List of content assignments.
 * @returns {{
*  assignments: Array,
*  hasAssignments: Boolean,
*  allocatedAssignments: Array,
*  hasAllocatedAssignments: Boolean,
*  canceledAssignments: Array,
*  hasCanceledAssignments: Boolean,
*  acceptedAssignments: Array,
*  hasAcceptedAssignments: Boolean,
* }}
*/
export function getAssignmentsByState(assignments = []) {
  const allocatedAssignments = [];
  const acceptedAssignments = [];
  const canceledAssignments = [];
  const expiredAssignments = [];
  const erroredAssignments = [];
  const assignmentsForDisplay = [];

  assignments.forEach((assignment) => {
    switch (assignment.state) {
      case ASSIGNMENT_TYPES.ALLOCATED:
        allocatedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ACCEPTED:
        acceptedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.CANCELED:
        canceledAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.EXPIRED:
        expiredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ERRORED:
        erroredAssignments.push(assignment);
        break;
      default:
        logError(`[getAssignmentsByState] Unsupported state ${assignment.state} for assignment ${assignment.uuid}`);
        break;
    }
  });

  const hasAssignments = assignments.length > 0;
  const hasAllocatedAssignments = allocatedAssignments.length > 0;
  const hasAcceptedAssignments = acceptedAssignments.length > 0;
  const hasCanceledAssignments = canceledAssignments.length > 0;
  const hasExpiredAssignments = expiredAssignments.length > 0;
  const hasErroredAssignments = erroredAssignments.length > 0;

  // Concatenate all assignments for display (includes allocated and canceled assignments)
  assignmentsForDisplay.push(...allocatedAssignments);
  assignmentsForDisplay.push(...canceledAssignments);
  assignmentsForDisplay.push(...expiredAssignments);
  const hasAssignmentsForDisplay = assignmentsForDisplay.length > 0;

  return {
    assignments,
    hasAssignments,
    allocatedAssignments,
    hasAllocatedAssignments,
    acceptedAssignments,
    hasAcceptedAssignments,
    canceledAssignments,
    hasCanceledAssignments,
    expiredAssignments,
    hasExpiredAssignments,
    erroredAssignments,
    hasErroredAssignments,
    assignmentsForDisplay,
    hasAssignmentsForDisplay,
  };
}
