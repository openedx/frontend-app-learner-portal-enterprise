import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryAcademiesDetail } from '../../app/data';

type AcademyRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly academyUUID: string;
  readonly enterpriseSlug: string;
};
interface AcademyLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: AcademyRouteParams;
}

const makeAcademiesLoader: Types.MakeRouteLoaderFunctionWithQueryClient = function makeAcademiesLoader(queryClient) {
  return async function academiesLoader({ params, request }: AcademyLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { academyUUID, enterpriseSlug } = params;
    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    await queryClient.ensureQueryData(queryAcademiesDetail(academyUUID, enterpriseCustomer.uuid));

    return null;
  };
};

export default makeAcademiesLoader;
