import { matchPath } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';

import {
  queryAcademiesList,
  queryBrowseAndRequestConfiguration,
  queryCanRedeem,
  queryCanRequest,
  queryContentHighlightsConfiguration,
  queryContentHighlightSets,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryCourseMetadata,
  queryCourseRecommendations,
  queryCourseReviews,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseCustomerContainsContent,
  queryEnterpriseLearner,
  queryEnterpriseLearnerAcademyBFF,
  queryEnterpriseLearnerDashboardBFF,
  queryEnterpriseLearnerOffers,
  queryEnterpriseLearnerSearchBFF,
  queryEnterpriseLearnerSkillsQuizBFF,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  queryUserEntitlements,
} from './queries';
import { getBaseSubscriptionsData } from '../constants';
import { getErrorResponseStatusCode } from '../../../../utils/common';

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
    hasBnrEnabledPolicy: false,
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
      hasBnrEnabledPolicy: (bffResponse as any).hasBnrEnabledPolicy || false,
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
    retry?: boolean | number;
  };
  shouldLogError?: boolean | ((err: Error) => boolean);
  fallbackData?: TData;
};

export function ignoreQueryResponseError404(error) {
  return getErrorResponseStatusCode(error) !== 404;
}

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
    return await queryClient.ensureQueryData<TData>(query);
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

export async function safeEnsureQueryDataCustomerContainsContent({
  queryClient,
  enterpriseCustomer,
  courseKey,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, [courseKey]),
    fallbackData: {
      containsContentItems: false,
      catalogList: [],
    },
  });
}

export async function safeEnsureQueryDataRedeemablePolicies({ queryClient, authenticatedUser, enterpriseCustomer }) {
  return safeEnsureQueryData({
    queryClient,
    query: queryRedeemablePolicies({
      enterpriseUuid: enterpriseCustomer.uuid,
      lmsUserId: authenticatedUser.userId,
    }),
    fallbackData: {
      redeemablePolicies: [],
      expiredPolicies: [],
      unexpiredPolicies: [],
      learnerContentAssignments: {
        assignments: [],
        hasAssignments: false,
        allocatedAssignments: [],
        hasAllocatedAssignments: false,
        acceptedAssignments: [],
        hasAcceptedAssignments: false,
        canceledAssignments: [],
        hasCanceledAssignments: false,
        expiredAssignments: [],
        hasExpiredAssignments: false,
        erroredAssignments: [],
        hasErroredAssignments: false,
        assignmentsForDisplay: [],
        hasAssignmentsForDisplay: false,
        reversedAssignments: [],
        hasReversedAssignments: false,
      },
      learnerRequests: [],
    },
  });
}

export async function safeEnsureQueryDataCouponCodes({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: {
      ...queryCouponCodes(enterpriseCustomer.uuid),
      retry: false,
    },
    fallbackData: {
      couponsOverview: [],
      couponCodeAssignments: [],
      couponCodeRedemptionCount: 0,
    },
  });
}

export async function safeEnsureQueryDataSubscriptions({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: querySubscriptions(enterpriseCustomer.uuid),
    fallbackData: getBaseSubscriptionsData().baseSubscriptionsData,
  });
}

export async function safeEnsureQueryDataEnterpriseOffers({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: {
      queryKey: queryEnterpriseLearnerOffers(enterpriseCustomer.uuid).queryKey,
      queryFn: () => (
        {
          enterpriseOffers: [],
          currentEnterpriseOffers: [],
          // Note: We are hard coding to false since offers are now deprecated as of 09/15/2025, HU
          canEnrollWithEnterpriseOffers: false,
          hasCurrentEnterpriseOffers: false,
          hasLowEnterpriseOffersBalance: false,
          hasNoEnterpriseOffersBalance: true,
        }
      ),
      retry: false,
    },
    fallbackData: {
      enterpriseOffers: [],
      currentEnterpriseOffers: [],
      canEnrollWithEnterpriseOffers: false,
      hasCurrentEnterpriseOffers: false,
      hasLowEnterpriseOffersBalance: false,
      hasNoEnterpriseOffersBalance: false,
    },
  });
}

export async function safeEnsureQueryDataLicenseRequests({
  queryClient,
  enterpriseCustomer,
  authenticatedUser,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryLicenseRequests(enterpriseCustomer.uuid, authenticatedUser.email),
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataCouponCodeRequests({
  queryClient,
  enterpriseCustomer,
  authenticatedUser,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: {
      ...queryCouponCodeRequests(enterpriseCustomer.uuid, authenticatedUser.email),
      retry: false,
    },
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataBrowseAndRequestConfiguration({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
    shouldLogError: ignoreQueryResponseError404,
    fallbackData: null,
  });
}

export async function safeEnsureQueryDataCanRedeem({
  queryClient,
  enterpriseCustomer,
  courseMetadata,
  courseRunKeysForRedemption = [],
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryCanRedeem(enterpriseCustomer.uuid, courseMetadata.key, courseRunKeysForRedemption),
    shouldLogError: ignoreQueryResponseError404,
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataCanRequest({
  queryClient,
  enterpriseCustomer,
  courseKey,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryCanRequest(enterpriseCustomer.uuid, courseKey),
    shouldLogError: ignoreQueryResponseError404,
    fallbackData: {
      canRequest: false,
      requestableSubsidyAccessPolicy: null,
      reason: null,
    },
  });
}

export async function safeEnsureQueryDataEnterpriseCourseEnrollments({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
    shouldLogError: ignoreQueryResponseError404,
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataUserEntitlements({
  queryClient,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryUserEntitlements(),
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataCourseReviews({
  queryClient,
  courseKey,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryCourseReviews(courseKey),
    shouldLogError: ignoreQueryResponseError404,
    fallbackData: null,
  });
}

type SafeEnsureQueryDataCourseRecommendationsArgs = {
  queryClient: QueryClient;
  enterpriseCustomer: EnterpriseCustomer;
  courseKey: string;
  searchCatalogs?: string[];
};

export async function safeEnsureQueryDataCourseRecommendations({
  queryClient,
  enterpriseCustomer,
  courseKey,
  searchCatalogs = [],
}: SafeEnsureQueryDataCourseRecommendationsArgs) {
  return safeEnsureQueryData({
    queryClient,
    query: queryCourseRecommendations(
      enterpriseCustomer.uuid,
      courseKey,
      searchCatalogs,
    ),
    fallbackData: {
      allRecommendations: [],
      samePartnerRecommendations: [],
    },
  });
}

export async function safeEnsureQueryDataProgramsList({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryEnterpriseProgramsList(enterpriseCustomer.uuid),
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataPathwaysList({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryEnterprisePathwaysList(enterpriseCustomer.uuid),
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataCourseMetadata({
  queryClient,
  courseKey,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryCourseMetadata(courseKey),
    fallbackData: null,
  });
}

export async function safeEnsureQueryDataAcademiesList({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryAcademiesList(enterpriseCustomer.uuid),
    fallbackData: [],
  });
}

export async function safeEnsureQueryDataContentHighlightsConfiguration({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
    fallbackData: null,
  });
}

export async function safeEnsureQueryDataContentHighlightSets({
  queryClient,
  enterpriseCustomer,
}) {
  return safeEnsureQueryData({
    queryClient,
    query: queryContentHighlightSets(enterpriseCustomer.uuid),
    fallbackData: [],
  });
}
