import { matchPath } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';

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
 * Helper function to parse the data source for the enterprise learner data from either the
 * BFF layer or the Enterprise learner endpoint directly, or the query cache if data is fresh.
 */
export async function getEnterpriseLearnerQueryData({
  requestUrl,
  queryClient,
  enterpriseSlug,
  authenticatedUser,
}: GetEnterpriseLearnerQueryDataArgs) {
  let enterpriseLearnerData: EnterpriseLearnerData = {
    enterpriseCustomer: null,
    activeEnterpriseCustomer: null,
    allLinkedEnterpriseCustomerUsers: [],
    enterpriseFeatures: {},
    staffEnterpriseCustomer: null,
    shouldUpdateActiveEnterpriseCustomerUser: false,
  };

  const matchedBFFQuery = resolveBFFQuery(requestUrl.pathname);
  if (matchedBFFQuery) {
    // Handle BFF query, if applicable.
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

type SafeEnsureQueryDataArgs<TData = unknown> = {
  queryClient: QueryClient;
  query: {
    queryKey: QueryKey;
    queryFn: QueryFunction<TData>;
  };
  shouldLogError?: boolean | ((err: Error) => boolean);
  fallbackData?: TData;
};

/**
 * Wraps a promise in a try/catch block and returns null if the promise is rejected. Using
 * this helper function ensures that errors are handled gracefully within route loaders.
 */
export async function safeEnsureQueryData<TData = unknown>({
  queryClient,
  query,
  shouldLogError = true,
  fallbackData,
}: SafeEnsureQueryDataArgs<TData>) {
  try {
    const data = await queryClient.ensureQueryData<TData>(query);
    return data;
  } catch (err) {
    const shouldLogErrorResult = typeof shouldLogError === 'function'
      ? shouldLogError(err as Error)
      : shouldLogError;

    if (shouldLogErrorResult) {
      logError(err);
    }

    // On query error, set the query data to the given fallback data.
    const { queryKey } = query;
    queryClient.setQueryData(queryKey, fallbackData);
    return fallbackData as TData;
  }
}
