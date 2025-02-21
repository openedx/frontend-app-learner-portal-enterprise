import { generatePath, matchPath, redirect } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';
import { fetchAuthenticatedUser, getLoginRedirectUrl } from '@edx/frontend-platform/auth';
import { getProxyLoginUrl } from '@edx/frontend-enterprise-logistration';
import Cookies from 'universal-cookie';

import {
  activateOrAutoApplySubscriptionLicense,
  addLicenseToSubscriptionLicensesByStatus,
  queryAcademiesList,
  queryBrowseAndRequestConfiguration,
  queryContentHighlightsConfiguration,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  resolveBFFQuery,
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
  const matchedBFFQuery = resolveBFFQuery(
    requestUrl.pathname,
  );
  const enterpriseAppDataQueries = [];
  if (!matchedBFFQuery) {
    const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
    enterpriseAppDataQueries.push(
      // Enterprise Customer User Subsidies
      queryClient.ensureQueryData(subscriptionsQuery).then(async (subscriptionsData) => {
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
          queryClient.setQueryData(subscriptionsQuery.queryKey, {
            ...queryClient.getQueryData(subscriptionsQuery.queryKey),
            subscriptionLicensesByStatus: updatedLicensesByStatus,
            subscriptionPlan: activatedOrAutoAppliedLicense.subscriptionPlan,
            subscriptionLicense: activatedOrAutoAppliedLicense,
            subscriptionLicenses: updatedSubscriptionLicenses,
          });
        }

        return subscriptionsData;
      }),
    );
  }
  enterpriseAppDataQueries.push(...[
    // Redeemable Learner Credit Policies
    queryClient.ensureQueryData(
      queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: userId,
      }),
    ),
    // Enterprise Coupon Codes
    queryClient.ensureQueryData(
      queryCouponCodes(enterpriseCustomer.uuid),
    ),
    // Enterprise Learner Offers
    queryClient.ensureQueryData(
      queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    ),
    // Browse and Request Configuration
    queryClient.ensureQueryData(
      queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
    ),
    // License Requests
    queryClient.ensureQueryData(
      queryLicenseRequests(enterpriseCustomer.uuid, userEmail),
    ),
    // Coupon Code Requests
    queryClient.ensureQueryData(
      queryCouponCodeRequests(enterpriseCustomer.uuid, userEmail),
    ),
    // Content Highlights
    queryClient.ensureQueryData(
      queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
    ),
    // Academies List
    queryClient.ensureQueryData(
      queryAcademiesList(enterpriseCustomer.uuid),
    ),
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
