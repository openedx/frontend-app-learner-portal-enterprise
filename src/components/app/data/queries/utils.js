import { matchPath } from 'react-router-dom';
import { queryEnterpriseLearnerDashboardBFF } from './queries';
import { isBFFEnabledForEnterpriseCustomer } from '../utils';

/**
 * Resolves the appropriate BFF query function to use for the current route.
 * @param {string} pathname - The current route pathname.
 * @returns {Function|null} The BFF query function to use for the current route, or null if no match is found.
 */
export function resolveBFFQuery(pathname, options = {}) {
  // Define route patterns and their corresponding query functions
  const { enterpriseCustomerUuid } = options;

  const isBFFEnabledForCustomer = isBFFEnabledForEnterpriseCustomer(enterpriseCustomerUuid);
  if (!isBFFEnabledForCustomer) {
    return null;
  }

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
