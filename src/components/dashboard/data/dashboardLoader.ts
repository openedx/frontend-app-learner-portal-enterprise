import { ensureAuthenticatedUser, redirectToSearchPageForNewUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  extractEnterpriseFeatures,
  queryEnterpriseCourseEnrollments,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryRedeemablePolicies,
  resolveBFFQuery,
} from '../../app/data';

type DashboardRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly enterpriseSlug: string;
};
interface DashboardLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: DashboardRouteParams;
}
interface DashboardBFFResponse {
  enterpriseCourseEnrollments: Types.EnterpriseCourseEnrollment[];
}

/**
 * Returns a loader function responsible for loading the dashboard related data.
 */
const makeDashboardLoader: Types.MakeRouteLoaderFunctionWithQueryClient = function makeDashboardLoader(queryClient) {
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
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    // Extract enterprise features.
    const enterpriseFeatures = await extractEnterpriseFeatures({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    // Attempt to resolve the BFF query for the dashboard.
    const dashboardBFFQuery = resolveBFFQuery(
      requestUrl.pathname,
      {
        enterpriseCustomerUuid: enterpriseCustomer.uuid,
        enterpriseFeatures,
      },
    );

    // Load enrollments, policies, and conditionally redirect for new users
    const loadEnrollmentsPoliciesAndRedirectForNewUsers = Promise.all([
      queryClient.ensureQueryData(
        dashboardBFFQuery
          ? dashboardBFFQuery({ enterpriseSlug })
          : queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
      ),
      queryClient.ensureQueryData(queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: authenticatedUser.userId,
      })),
    ]).then((responses) => {
      const enterpriseCourseEnrollments = dashboardBFFQuery
        ? (responses[0] as DashboardBFFResponse).enterpriseCourseEnrollments
        : responses[0] as Types.EnterpriseCourseEnrollment[];
      const redeemablePolicies = responses[1];
      // Redirect user to search page, for first-time users with no enrollments and/or assignments.
      redirectToSearchPageForNewUser({
        enterpriseSlug: enterpriseSlug as string,
        enterpriseCourseEnrollments,
        redeemablePolicies,
      });
    });

    await Promise.all([
      loadEnrollmentsPoliciesAndRedirectForNewUsers,
      queryClient.ensureQueryData(queryEnterpriseProgramsList(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterprisePathwaysList(enterpriseCustomer.uuid)),
    ]);

    return null;
  };
};

export default makeDashboardLoader;
