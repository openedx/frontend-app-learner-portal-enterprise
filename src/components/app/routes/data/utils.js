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
  NewRelicLoggingService,
} from '@edx/frontend-platform/logging';
import { getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import Cookies from 'universal-cookie';

import {
  activateOrAutoApplySubscriptionLicense,
  queryBrowseAndRequestConfiguration,
  queryContentHighlightsConfiguration,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryNotices,
  queryRedeemablePolicies,
  querySubscriptions,
  updateUserActiveEnterprise,
} from '../../data';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function ensureEnterpriseAppData({
  enterpriseCustomer,
  allLinkedEnterpriseCustomerUsers,
  userId,
  userEmail,
  queryClient,
  requestUrl,
}) {
  const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
  const enterpriseAppDataQueries = [
    // Enterprise Customer User Subsidies
    // eslint-disable-next-line arrow-body-style
    queryClient.ensureQueryData(subscriptionsQuery).then(async (subscriptionsData) => {
      // Auto-activate the user's subscription license, if applicable.
      const activatedOrAutoAppliedLicense = await activateOrAutoApplySubscriptionLicense({
        enterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
        subscriptionsData,
        requestUrl,
        queryClient,
        subscriptionsQuery,
      });
      if (activatedOrAutoAppliedLicense) {
        const { licensesByStatus } = subscriptionsData;
        const updatedLicensesByStatus = { ...licensesByStatus };
        Object.entries(licensesByStatus).forEach(([status, licenses]) => {
          const hasActivatedOrAutoAppliedLicense = licenses.some(
            (license) => license.uuid === activatedOrAutoAppliedLicense.uuid,
          );
          const isCurrentStatusMatchingLicenseStatus = status === activatedOrAutoAppliedLicense.status;
          if (hasActivatedOrAutoAppliedLicense) {
            updatedLicensesByStatus[status] = isCurrentStatusMatchingLicenseStatus
              ? licenses.filter((license) => license.uuid !== activatedOrAutoAppliedLicense.uuid)
              : [...licenses, activatedOrAutoAppliedLicense];
          }
        });
        // Optimistically update the query cache with the auto-activated or auto-applied subscription license.
        queryClient.setQueryData(subscriptionsQuery.queryKey, {
          ...queryClient.getQueryData(subscriptionsQuery.queryKey),
          licensesByStatus: updatedLicensesByStatus,
          subscriptionLicense: activatedOrAutoAppliedLicense,
          subscriptionLicenses: subscriptionsData.subscriptionLicenses.map((license) => {
            // Ensures an auto-activated license is updated in the query cache to change
            // its status from "assigned" to "activated".
            if (license.uuid === activatedOrAutoAppliedLicense.uuid) {
              return activatedOrAutoAppliedLicense;
            }
            return license;
          }),
        });
      }

      return subscriptionsData;
    }),
    queryClient.ensureQueryData(
      queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: userId,
      }),
    ),
    queryClient.ensureQueryData(
      queryCouponCodes(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
    ),
    queryClient.ensureQueryData(
      queryLicenseRequests(enterpriseCustomer.uuid, userEmail),
    ),
    queryClient.ensureQueryData(
      queryCouponCodeRequests(enterpriseCustomer.uuid, userEmail),
    ),
    // Content Highlights
    queryClient.ensureQueryData(
      queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
    ),
  ];
  if (getConfig().ENABLE_NOTICES) {
    enterpriseAppDataQueries.push(
      queryClient.ensureQueryData(
        queryNotices(),
      ),
    );
  }
  const enterpriseAppData = await Promise.all(enterpriseAppDataQueries);
  return enterpriseAppData;
}

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

configureLogging(NewRelicLoggingService, {
  config: getConfig(),
});
configureAuth(AxiosJwtAuthService, {
  loggingService: getLoggingService(),
  config: getConfig(),
});

/**
 * Ensures that the user is authenticated. If not, redirects to the login page.
 * @param {URL} requestUrl - The current request URL to redirect back to if the
 *  user is not authenticated.
 * @param {Object} params - The parameters object.
 */
export async function ensureAuthenticatedUser(requestUrl, params) {
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
 * TODO
 * @param {*} enterpriseSlug
 * @param {*} activeEnterpriseCustomer
 * @param {*} staffEnterpriseCustomer
 * @param {*} allLinkedEnterpriseCustomerUsers
 * @param {*} requestUrl
 * @returns
 */
export async function ensureActiveEnterpriseCustomerUser({
  enterpriseSlug,
  activeEnterpriseCustomer,
  staffEnterpriseCustomer,
  allLinkedEnterpriseCustomerUsers,
  requestUrl,
}) {
  // If the enterprise slug in the URL matches the active enterprise customer user's slug OR no
  // active enterprise customer exists, return early.
  if (!activeEnterpriseCustomer || activeEnterpriseCustomer.slug === enterpriseSlug) {
    return null;
  }

  // Otherwise, try to find the enterprise customer for the given slug and, if found, update it
  // as the active enterprise customer for the learner.
  const foundEnterpriseCustomerUserForSlug = allLinkedEnterpriseCustomerUsers.find(
    enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  );
  if (foundEnterpriseCustomerUserForSlug) {
    const {
      enterpriseCustomer: nextActiveEnterpriseCustomer,
    } = foundEnterpriseCustomerUserForSlug;
    // Makes the POST API request to update the active enterprise customer
    // for the learner in the backend for future sessions.
    await updateUserActiveEnterprise({
      enterpriseCustomer: nextActiveEnterpriseCustomer,
    });
    const updatedLinkedEnterpriseCustomerUsers = allLinkedEnterpriseCustomerUsers.map(
      ecu => ({
        ...ecu,
        active: (
          ecu.enterpriseCustomer.uuid === nextActiveEnterpriseCustomer.uuid
        ),
      }),
    );
    return {
      enterpriseCustomer: nextActiveEnterpriseCustomer,
      updatedLinkedEnterpriseCustomerUsers,
    };
  }
  if (staffEnterpriseCustomer) {
    return null;
  }
  throw redirect(generatePath('/:enterpriseSlug/*', {
    enterpriseSlug: activeEnterpriseCustomer.slug,
    '*': requestUrl.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
  }));
}
