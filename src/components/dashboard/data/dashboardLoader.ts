import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryEnterpriseCourseEnrollments,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
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
const makeDashboardLoader: Types.MakeRouteLoaderFunction = function makeDashboardLoader(queryClient) {
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
    await Promise.all([
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterpriseProgramsList(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterprisePathwaysList(enterpriseCustomer.uuid)),
    ]);

    return null;
  };
};

export default makeDashboardLoader;
