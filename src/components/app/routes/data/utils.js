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
  queryEnterpriseLearnerDashboardBFF,
  queryBrowseAndRequestConfiguration,
  queryContentHighlightsConfiguration,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryNotices,
  queryRedeemablePolicies,
  querySubscriptions,
} from '../../data/queries';

import {
  activateOrAutoApplySubscriptionLicense,
  updateUserActiveEnterprise,
} from '../../data/services';

/**
 * Resolves the appropriate BFF query function to use for the current route.
 * @param {string} pathname - The current route pathname.
 * @returns {Function|null} The BFF query function to use for the current route, or null if no match is found.
 */
export function resolveBFFQuery(pathname) {
  // Define route patterns and their corresponding query functions
  const routeToBFFQueryMap = [
    {
      pattern: '/:enterpriseSlug',
      query: queryEnterpriseLearnerDashboardBFF,
    },
    // Add more routes and queries incrementally as needed
  ];

  // Find the matching route and return the corresponding query function
  const matchedRoute = routeToBFFQueryMap.find((route) => matchPath(route.pattern, pathname));

  if (matchedRoute) {
    return matchedRoute.query;
  }

  // No match found
  return null;
}

/**
 * Ensures all enterprise-related app data is loaded.
 * @param {*} options
 * @param {*} options.requestUrl
 * @param {*} options.enterpriseCustomer
 * @param {*} options.allLinkedEnterpriseCustomerUsers
 * @param {*} options.userId
 * @param {*} options.userEmail
 * @param {Types.QueryClient} options.queryClient
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
  const enterpriseAppDataQueries = [];
  const resolvedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  if (!resolvedBFFQuery) {
    /**
     * If the user is visiting a route configured to use a BFF, return early to avoid
     * auto-activating or auto-applying the user's subscription license. All other
     * routes will auto-activate or auto-apply the user's subscription license through
     * the below logic.
     *
     * This is to an incremental migration to the Learner Portal's suite of
     * Backend-for-Frontend (BFF) APIs, where the subscription license activation
     * or auto-application is handled by the Learner BFF.
     *
     * As such, the dashboardLoader is now responsible for the auto-activation or auto-application of the
     * user's subscription license via the Dashboard BFF. The existing subscriptions-related query cache will be
     * optimistilly updated with the auto-activated or auto-applied subscription license, if applicable,
     * after resolving the dashboardLoader's request to the dashboard's BFF API.
     */
    const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
    enterpriseAppDataQueries.push(
      queryClient.ensureQueryData(subscriptionsQuery).then(async (subscriptionsData) => {
        // Auto-activate or auto-apply the user's subscription license, if applicable.
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
            const licensesIncludesActivatedOrAutoAppliedLicense = licenses.some(
              (license) => license.uuid === activatedOrAutoAppliedLicense.uuid,
            );
            const isCurrentStatusMatchingLicenseStatus = status === activatedOrAutoAppliedLicense.status;
            if (licensesIncludesActivatedOrAutoAppliedLicense) {
              updatedLicensesByStatus[status] = isCurrentStatusMatchingLicenseStatus
                ? licenses.filter((license) => license.uuid !== activatedOrAutoAppliedLicense.uuid)
                : [...licenses, activatedOrAutoAppliedLicense];
            } else if (isCurrentStatusMatchingLicenseStatus) {
              updatedLicensesByStatus[activatedOrAutoAppliedLicense.status].push(activatedOrAutoAppliedLicense);
            }
          });
          // Optimistically update the query cache with the auto-activated or auto-applied subscription license.
          const updatedSubscriptionLicenses = subscriptionsData.subscriptionLicenses.length > 0
            ? subscriptionsData.subscriptionLicenses.map((license) => {
              // Ensures an auto-activated license is updated in the query cache to change
              // its status from "assigned" to "activated".
              if (license.uuid === activatedOrAutoAppliedLicense.uuid) {
                return activatedOrAutoAppliedLicense;
              }
              return license;
            })
            : [activatedOrAutoAppliedLicense];

          queryClient.setQueryData(subscriptionsQuery.queryKey, {
            ...queryClient.getQueryData(subscriptionsQuery.queryKey),
            licensesByStatus: updatedLicensesByStatus,
            subscriptionPlan: activatedOrAutoAppliedLicense.subscriptionPlan,
            subscriptionLicense: activatedOrAutoAppliedLicense,
            subscriptionLicenses: updatedSubscriptionLicenses,
          });
        }

        return subscriptionsData;
      }),
    );
  }

  // Load the rest of the enterprise app data.
  enterpriseAppDataQueries.push(...[
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
  ]);

  if (getConfig().ENABLE_NOTICES) {
    enterpriseAppDataQueries.push(
      queryClient.ensureQueryData(queryNotices()),
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

// Configure the logging and authentication services, only for non-test environments.
if (process.env.NODE_ENV !== 'test') {
  configureLogging(NewRelicLoggingService, {
    config: getConfig(),
  });
  configureAuth(AxiosJwtAuthService, {
    loggingService: getLoggingService(),
    config: getConfig(),
  });
}

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
 * Ensures the user's EnterpriseCustomerUser is marked as active when
 * visiting its customer slug.
 * @param {Objects} params
 * @param {*} params.enterpriseSlug
 * @param {*} params.activeEnterpriseCustomer
 * @param {*} params.staffEnterpriseCustomer
 * @param {*} params.allLinkedEnterpriseCustomerUsers
 * @param {*} params.requestUrl
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
    enterpriseCustomerUser => {
      if (!enterpriseCustomerUser.enterpriseCustomer) {
        return false;
      }
      return enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug;
    },
  );
  if (enterpriseSlug && foundEnterpriseCustomerUserForSlug) {
    const {
      enterpriseCustomer: nextActiveEnterpriseCustomer,
    } = foundEnterpriseCustomerUserForSlug;
    // Makes the POST API request to update the active enterprise customer
    // for the learner in the backend for future sessions.
    await updateUserActiveEnterprise({ enterpriseCustomer: nextActiveEnterpriseCustomer });
    const updatedLinkedEnterpriseCustomerUsers = allLinkedEnterpriseCustomerUsers.map(
      ecu => ({
        ...ecu,
        active: !!(ecu.enterpriseCustomer?.uuid === nextActiveEnterpriseCustomer.uuid),
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
