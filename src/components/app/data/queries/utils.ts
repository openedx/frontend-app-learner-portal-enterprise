import { QueryClient } from '@tanstack/react-query';
import { matchPath } from 'react-router-dom';
import {
  queryEnterpriseLearner,
  queryEnterpriseLearnerAcademyBFF,
  queryEnterpriseLearnerDashboardBFF,
  queryEnterpriseLearnerSearchBFF,
  queryEnterpriseLearnerSkillsQuizBFF,
} from './queries';

/**
 * Resolves the appropriate BFF query function to use for the current route.
 * @param pathname - The current route pathname.
 * @returns The BFF query function to use for the current route, or null if no match is found.
 */
export function resolveBFFQuery<TQuery = BFFQuery | null>(pathname: string) {
  // Define route patterns and their corresponding query functions
  const routeToBFFQueryMap = [
    {
      pattern: '/:enterpriseSlug',
      query: queryEnterpriseLearnerDashboardBFF,
    },
    {
      pattern: '/:enterpriseSlug/search/:pathwayUUID?',
      query: queryEnterpriseLearnerSearchBFF,
    },
    {
      pattern: '/:enterpriseSlug/academies/:academyUUID',
      query: queryEnterpriseLearnerAcademyBFF,
    },
    {
      pattern: '/:enterpriseSlug/skills-quiz',
      query: queryEnterpriseLearnerSkillsQuizBFF,
    },
    // Add more routes and queries incrementally as needed
  ];

  // Find the matching route and return the corresponding query function
  const matchedRoute = routeToBFFQueryMap.find((route) => matchPath(route.pattern, pathname));

  if (matchedRoute) {
    return matchedRoute.query as TQuery;
  }

  // No match found
  return null as TQuery;
}

type GetEnterpriseLearnerQueryDataArgs = {
  requestUrl: URL;
  queryClient: QueryClient;
  enterpriseSlug?: string;
  authenticatedUser: AuthenticatedUser;
};

/**
 * Helper function to parse the datasource for the enterprise learner data from either the
 * BFF layer or the Enterprise learner endpoint directly. We pass in the fallback
 * queryEnterpriseLearner to avoid dependency cycle issues
 */
export async function getEnterpriseLearnerQueryData({
  requestUrl,
  queryClient,
  enterpriseSlug,
  authenticatedUser,
}: GetEnterpriseLearnerQueryDataArgs) {
  // Retrieve linked enterprise customers for the current user from query cache
  // or fetch from the server if not available.
  let enterpriseLearnerData: EnterpriseLearnerData = {
    enterpriseCustomer: null,
    activeEnterpriseCustomer: null,
    allLinkedEnterpriseCustomerUsers: [],
    enterpriseFeatures: {},
    staffEnterpriseCustomer: null,
    shouldUpdateActiveEnterpriseCustomerUser: false,
  };

  // Handle BFF query, if applicable:
  const matchedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  if (matchedBFFQuery) {
    const bffResponse = await queryClient.ensureQueryData<BFFResponse>(
      matchedBFFQuery({ enterpriseSlug: enterpriseSlug! }),
    );
    enterpriseLearnerData = {
      enterpriseCustomer: bffResponse.enterpriseCustomer || null,
      activeEnterpriseCustomer: bffResponse.activeEnterpriseCustomer || null,
      allLinkedEnterpriseCustomerUsers: bffResponse.allLinkedEnterpriseCustomerUsers || [],
      staffEnterpriseCustomer: bffResponse.staffEnterpriseCustomer || null,
      enterpriseFeatures: bffResponse.enterpriseFeatures || {},
      shouldUpdateActiveEnterpriseCustomerUser: bffResponse.shouldUpdateActiveEnterpriseCustomerUser,
    };
  } else {
    // Otherwise, handle legacy direct query
    enterpriseLearnerData = await queryClient.ensureQueryData(
      queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
    );
  }

  return {
    data: enterpriseLearnerData,
    isBFFData: !!matchedBFFQuery,
  };
}
