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

import { makeEnterpriseLearnerQuery } from '../queries';

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
 * Extracts the appropriate enterprise ID for the current user and enterprise slug.
 * @param {Object} params - The parameters object.
 * @param {Object} params.queryClient - The query client.
 * @param {Object} params.authenticatedUser - The authenticated user.
 * @param {string} params.enterpriseSlug - The enterprise slug.
 * @returns {Promise<string>} - The enterprise ID to use for subsquent queries in route loaders.
 */
export async function extractEnterpriseId({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
}) {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(authenticatedUser.username, enterpriseSlug);
  const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
  const {
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  } = enterpriseLearnerData;

  // If there is no slug provided (i.e., on the root page route `/`), use
  // the currently active enterprise customer.
  if (!enterpriseSlug) {
    return activeEnterpriseCustomer.uuid;
  }

  // Otherwise, there is a slug provided for a specific enterprise customer. If the
  // enterprise customer for the given slug is associated to one linked to the learner,
  // return the enterprise ID for that enterprise customer.
  const foundEnterpriseIdForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  )?.enterpriseCustomer.uuid;

  if (foundEnterpriseIdForSlug) {
    return foundEnterpriseIdForSlug;
  }

  // If no enterprise customer is found for the given user/slug, throw an error.
  throw new Error(`Could not find enterprise customer for user ${authenticatedUser.userId} and slug ${enterpriseSlug}`);
}

/**
 * Ensures that the user is authenticated. If not, redirects to the login page.
 * @param {URL} requestUrl - The current request URL to redirect back to if the
 *  user is not authenticated.
 */
export async function ensureAuthenticatedUser(requestUrl) {
  configureLogging(NewRelicLoggingService, {
    config: getConfig(),
  });
  configureAuth(AxiosJwtAuthService, {
    loggingService: getLoggingService(),
    config: getConfig(),
  });

  const authenticatedUser = await fetchAuthenticatedUser();
  if (!authenticatedUser) {
    // TODO: why is this no longer seeming to work?
    throw redirect(getLoginRedirectUrl(requestUrl.href));
  }
  return authenticatedUser;
}
