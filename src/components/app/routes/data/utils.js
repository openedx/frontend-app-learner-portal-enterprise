import { generatePath, matchPath, redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import Cookies from 'universal-cookie';
import { logError } from '@edx/frontend-platform/logging';
import {
  activateOrAutoApplySubscriptionLicense,
  addLicenseToSubscriptionLicensesByStatus,
  querySubscriptions,
  resolveBFFQuery,
  safeEnsureQueryDataAcademiesList,
  safeEnsureQueryDataBrowseAndRequestConfiguration,
  safeEnsureQueryDataContentHighlightsConfiguration,
  safeEnsureQueryDataCouponCodeRequests,
  safeEnsureQueryDataCouponCodes,
  safeEnsureQueryDataEnterpriseOffers,
  safeEnsureQueryDataLicenseRequests,
  safeEnsureQueryDataRedeemablePolicies,
  safeEnsureQueryDataSubscriptions,
  updateUserActiveEnterprise,
} from '../../data';

/**
 * Ensures all enterprise-related app data is loaded.
 * @param {*} options
 * @param {*} options.requestUrl
 * @param {*} options.enterpriseCustomer
 * @param {*} options.allLinkedEnterpriseCustomerUsers
 * @param {*} options.userId
 * @param {*} options.userEmail
 * @param {object} options.queryClient
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
  const matchedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  const enterpriseAppDataQueries = [];
  if (!matchedBFFQuery) {
    enterpriseAppDataQueries.push(
      // Enterprise Customer User Subsidies
      safeEnsureQueryDataSubscriptions({
        queryClient,
        enterpriseCustomer,
      })
        .then(async (subscriptionsData) => {
          // Auto-activate the user's subscription license, if applicable.
          const activatedOrAutoAppliedLicense = await activateOrAutoApplySubscriptionLicense({
            enterpriseCustomer,
            allLinkedEnterpriseCustomerUsers,
            subscriptionsData,
            requestUrl,
          });
          if (activatedOrAutoAppliedLicense) {
            const { subscriptionLicensesByStatus, subscriptionLicenses } = subscriptionsData;
            // Create a deep copy of the structure using .map for immutability, removing
            // the `activatedOrAutoAppliedLicense` from each list. Then, re-add the license
            // to the correct status list.
            const licensesByStatusWithoutExistingLicense = Object.fromEntries(
              Object.entries(subscriptionLicensesByStatus).map(([key, licenses]) => [
                key,
                licenses.filter(
                  (existingLicense) => existingLicense.uuid !== activatedOrAutoAppliedLicense.uuid,
                ), // Remove license immutably
              ]),
            );
            const updatedLicensesByStatus = addLicenseToSubscriptionLicensesByStatus({
              subscriptionLicensesByStatus: licensesByStatusWithoutExistingLicense,
              subscriptionLicense: activatedOrAutoAppliedLicense,
            });

            // Update the flat subscription licenses list
            const updatedSubscriptionLicenses = [...subscriptionLicenses];
            const licenseIndex = subscriptionLicenses.findIndex(
              (license) => license.uuid === activatedOrAutoAppliedLicense.uuid,
            );
            if (licenseIndex >= 0) {
              // Replace the existing license
              updatedSubscriptionLicenses[licenseIndex] = activatedOrAutoAppliedLicense;
            } else {
              // Add the new license
              updatedSubscriptionLicenses.push(activatedOrAutoAppliedLicense);
            }

            // Optimistically update the query cache with the auto-activated or auto-applied subscription license.
            const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
            queryClient.setQueryData(subscriptionsQuery.queryKey, (oldData) => ({
              ...oldData,
              subscriptionLicensesByStatus: updatedLicensesByStatus,
              subscriptionPlan: activatedOrAutoAppliedLicense.subscriptionPlan,
              subscriptionLicense: activatedOrAutoAppliedLicense,
              subscriptionLicenses: updatedSubscriptionLicenses,
            }));
          }

          return subscriptionsData;
        }),
    );
  }
  enterpriseAppDataQueries.push(...[
    // Redeemable Learner Credit Policies
    safeEnsureQueryDataRedeemablePolicies({
      queryClient,
      enterpriseCustomer,
      authenticatedUser: { userId },
    }),
    // Enterprise Coupon Codes
    safeEnsureQueryDataCouponCodes({
      queryClient,
      enterpriseCustomer,
    }),
    // Enterprise Learner Offers
    safeEnsureQueryDataEnterpriseOffers({
      queryClient,
      enterpriseCustomer,
    }),
    // Browse and Request Configuration
    safeEnsureQueryDataBrowseAndRequestConfiguration({
      queryClient,
      enterpriseCustomer,
    }),
    // License Requests
    safeEnsureQueryDataLicenseRequests({
      queryClient,
      enterpriseCustomer,
      authenticatedUser: { email: userEmail },
    }),
    // Coupon Code Requests
    safeEnsureQueryDataCouponCodeRequests({
      queryClient,
      enterpriseCustomer,
      authenticatedUser: { email: userEmail },
    }),
    // Content Highlights
    safeEnsureQueryDataContentHighlightsConfiguration({
      queryClient,
      enterpriseCustomer,
    }),
    // Academies List
    safeEnsureQueryDataAcademiesList({
      queryClient,
      enterpriseCustomer,
    }),
  ]);

  // Ensure all enterprise app data queries are resolved.
  await Promise.all(enterpriseAppDataQueries);
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
 * @param {Array} params.enterpriseCourseEnrollments - The enterprise course enrollments.
 * @param {Object} params.redeemablePolicies - The redeemable policies.
 */
export function redirectToSearchPageForNewUser({
  enterpriseSlug,
  enterpriseCourseEnrollments,
  redeemablePolicies,
}) {
  // If the user has already visited the dashboard, return early.
  if (localStorage.getItem('has-user-visited-learner-dashboard')) {
    return;
  }

  // Otherwise, set the localStorage item to indicate that the user has visited the dashboard.
  localStorage.setItem('has-user-visited-learner-dashboard', true);

  // If the current URL does not match the dashboard, return early. This covers the use
  // case where user may be on a non-dashboard route (e.g., search) and then explicitly
  // navigates to the dashboard route. If the user is not already on the dashboard route,
  // we do not want to trigger a redirect to the search page as the user explicitly requested
  // to view the dashboard.
  const isCurrentUrlMatchingDashboard = matchPath('/:enterpriseSlug', global.location.pathname);
  if (!isCurrentUrlMatchingDashboard) {
    return;
  }

  // Check whether user has any assignments for display or active enterprise course
  // enrollments. If not, redirect to the search page.
  const { hasAssignmentsForDisplay } = redeemablePolicies.learnerContentAssignments;
  const hasEnterpriseCourseEnrollments = enterpriseCourseEnrollments.length > 0;
  if (!(hasAssignmentsForDisplay || hasEnterpriseCourseEnrollments)) {
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
  enterpriseLearnerData,
  isBFFData,
  requestUrl,
  authenticatedUser,
  queryClient,
}) {
  let {
    enterpriseCustomer,
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  } = enterpriseLearnerData;
  const {
    staffEnterpriseCustomer,
    shouldUpdateActiveEnterpriseCustomerUser,
  } = enterpriseLearnerData;

  const matchedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  // If the enterprise slug in the URL matches the active enterprise customer user's slug OR no
  // active enterprise customer exists, return early.
  let nextActiveEnterpriseCustomer = null;

  if (shouldUpdateActiveEnterpriseCustomerUser) {
    // If this flag is truthy, we already know that the active enterprise customer user should be updated.
    nextActiveEnterpriseCustomer = enterpriseCustomer;
  } else if (!isBFFData) {
    // Otherwise, if we're using the non-BFF API data, we must determine if the active
    // enterprise customer user should be updated based on the enterprise slug in the URL.

    // If the enterprise slug in the URL matches the active enterprise customer user's
    // slug OR no active enterprise customer exists, return early.
    if (activeEnterpriseCustomer?.slug === enterpriseSlug) {
      return {
        enterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
      };
    }
    // Else, try to find the enterprise customer for the given slug and, if found, update it
    // as the active enterprise customer for the learner.
    const foundEnterpriseCustomerUserForSlug = allLinkedEnterpriseCustomerUsers.find(
      enterpriseCustomerUser => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
    );
    if (enterpriseSlug && foundEnterpriseCustomerUserForSlug) {
      nextActiveEnterpriseCustomer = foundEnterpriseCustomerUserForSlug.enterpriseCustomer;
    }
  }

  // If we've determined that the active enterprise customer user should be updated, update it.
  if (nextActiveEnterpriseCustomer) {
    try {
      await updateUserActiveEnterprise({ enterpriseCustomer: nextActiveEnterpriseCustomer });
    } catch (error) {
      error.message = `Unable to update active enterprise customer: ${nextActiveEnterpriseCustomer} for user ${authenticatedUser.userId}: ${error.message}`;
      logError(error);
      return {
        enterpriseCustomer,
        allLinkedEnterpriseCustomerUsers,
      };
    }
    // If the active enterprise customer user was updated, override the previous active
    // enterprise customer user data with the new active enterprise customer user data
    // for subsequent queries.
    const updatedLinkedEnterpriseCustomerUsers = allLinkedEnterpriseCustomerUsers.map(
      ecu => ({
        ...ecu,
        active: ecu.enterpriseCustomer.uuid === nextActiveEnterpriseCustomer.uuid,
      }),
    );
    enterpriseCustomer = nextActiveEnterpriseCustomer;
    activeEnterpriseCustomer = nextActiveEnterpriseCustomer;
    allLinkedEnterpriseCustomerUsers = updatedLinkedEnterpriseCustomerUsers;
    // Optimistically update the BFF query cache
    if (matchedBFFQuery) {
      queryClient.setQueryData(matchedBFFQuery({ enterpriseSlug }).queryKey, (oldData) => ({
        ...oldData,
        enterpriseCustomer,
        activeEnterpriseCustomer,
        allLinkedEnterpriseCustomerUsers: updatedLinkedEnterpriseCustomerUsers,
      }));
    }
    return {
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    };
  }

  // To enable staff users masquerading as enterprise customers, we need to ensure the
  // below redirect to the active enterprise customer user's slug does NOT occur, by
  // returning early with the staff enterprise customer data.
  if (staffEnterpriseCustomer) {
    return {
      enterpriseCustomer: staffEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    };
  }

  // Given the user has an active ECU, but the current route has no slug, redirect to the slug of the active ECU.
  if (activeEnterpriseCustomer && activeEnterpriseCustomer.slug !== enterpriseSlug) {
    throw redirect(generatePath('/:enterpriseSlug/*', {
      enterpriseSlug: activeEnterpriseCustomer.slug,
      '*': requestUrl.pathname.split('/').filter(pathPart => !!pathPart).slice(1).join('/'),
    }));
  }

  return {
    enterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  };
}
