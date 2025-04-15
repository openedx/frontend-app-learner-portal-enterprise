import { LoaderFunctionArgs, Params } from 'react-router-dom';
import { ensureAuthenticatedUser, redirectToSearchPageForNewUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryRedeemablePolicies,
  resolveBFFQuery,
  safeEnsureQueryData,
} from '../../app/data';

type DashboardRouteParams<Key extends string = string> = Params<Key> & {
  readonly enterpriseSlug: string;
};
interface DashboardLoaderFunctionArgs extends LoaderFunctionArgs {
  params: DashboardRouteParams;
}

/**
 * Returns a loader function responsible for loading the dashboard related data.
 */
const makeDashboardLoader: MakeRouteLoaderFunctionWithQueryClient = function makeDashboardLoader(queryClient) {
  return async function dashboardLoader({ params, request }: DashboardLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug } = params;

    // Extract enterprise customer.
    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }

    // Attempt to resolve the BFF query for the dashboard.
    const dashboardBFFQuery = resolveBFFQuery<BFFQueryDashboard>(
      requestUrl.pathname,
    );

    // Load enrollments, policies, and conditionally redirect for new users
    const loadEnrollmentsPoliciesAndRedirectForNewUsers = Promise.all([
      queryClient.ensureQueryData(dashboardBFFQuery({ enterpriseSlug })),
      safeEnsureQueryData({
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
        },
      }),
    ]).then((responses) => {
      const { enterpriseCourseEnrollments } = responses[0];
      const redeemablePolicies = responses[1];
      // Redirect user to search page, for first-time users with no enrollments and/or assignments.
      redirectToSearchPageForNewUser({
        enterpriseSlug: enterpriseSlug!,
        enterpriseCourseEnrollments,
        redeemablePolicies,
      });
    });

    await Promise.all([
      loadEnrollmentsPoliciesAndRedirectForNewUsers,
      safeEnsureQueryData({
        queryClient,
        query: queryEnterpriseProgramsList(enterpriseCustomer.uuid),
        fallbackData: [],
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryEnterprisePathwaysList(enterpriseCustomer.uuid),
        fallbackData: [],
      }),
    ]);

    return null;
  };
};

export default makeDashboardLoader;
