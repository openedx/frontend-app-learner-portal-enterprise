import { ensureAuthenticatedUser, redirectToSearchPageForNewUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryEnterpriseCourseEnrollments,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryRedeemablePolicies,
} from '../../app/data';

type DashboardRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly enterpriseSlug: string;
};
interface DashboardLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: DashboardRouteParams;
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
    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const loadEnrollmentsPoliciesAndRedirectForNewUsers = Promise.all([
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: authenticatedUser.userId,
      })),
    ]).then((responses) => {
      const enterpriseCourseEnrollments = responses[0];
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
