import { matchPath } from 'react-router-dom';
import { queryEnterpriseLearner, queryEnterpriseLearnerDashboardBFF } from './queries';

/**
 * Resolves the appropriate BFF query function to use for the current route.
 * @param {string} pathname - The current route pathname.
 * @param options
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
 * Helper function to parse the datasource for the enterprise learner data from either the
 * BFF layer or the Enterprise learner endpoint directly. We pass in the fallback
 * queryEnterpriseLearner to avoid dependency cycle issues
 *
 * @param requestUrl
 * @param queryClient
 * @param enterpriseSlug
 * @param authenticatedUser
 * @param queryEnterpriseLearnerConfig
 * @returns {
 * Promise<{
 * enterpriseCustomer,
 * activeEnterpriseCustomer,
 * allLinkedEnterpriseCustomerUsers,
 * staffEnterpriseCustomer,
 * enterpriseFeatures: *,
 * shouldUpdateActiveEnterpriseCustomerUser: *
 * }|*>}
 */
export async function getEnterpriseLearnerQueryData({
  requestUrl,
  queryClient,
  enterpriseSlug,
  authenticatedUser,
}) {
  // Retrieve linked enterprise customers for the current user from query cache
  // or fetch from the server if not available.
  let enterpriseLearnerData;
  const matchedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  if (matchedBFFQuery) {
    const bffResponse = await queryClient.ensureQueryData(
      matchedBFFQuery({ enterpriseSlug }),
    );
    enterpriseLearnerData = {
      enterpriseCustomer: bffResponse.enterpriseCustomer || null,
      activeEnterpriseCustomer: bffResponse.activeEnterpriseCustomer || null,
      allLinkedEnterpriseCustomerUsers: bffResponse.allLinkedEnterpriseCustomerUsers || [],
      staffEnterpriseCustomer: bffResponse.staffEnterpriseCustomer || null,
      enterpriseFeatures: bffResponse.enterpriseFeatures || {},
      shouldUpdateActiveEnterpriseCustomerUser: bffResponse.shouldUpdateActiveEnterpriseCustomerUser || false,
    };
  } else {
    enterpriseLearnerData = await queryClient.ensureQueryData(
      queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
    );
  }
  return { data: enterpriseLearnerData, isBFFData: !!matchedBFFQuery };
}
