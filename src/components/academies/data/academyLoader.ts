import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryAcademiesDetail } from '../../app/data';

type AcademyRouteParams<Key extends string = string> = RouteParams<Key> & {
  readonly academyUUID: string;
  readonly enterpriseSlug: string;
};
interface AcademyLoaderFunctionArgs extends RouteLoaderFunctionArgs {
  params: AcademyRouteParams;
}

const makeAcademiesLoader: MakeRouteLoaderFunctionWithQueryClient = function makeAcademiesLoader(queryClient) {
  return async function academiesLoader({ params, request }: AcademyLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { academyUUID, enterpriseSlug } = params;
    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    if (!enterpriseCustomer) {
      return null;
    }

    await queryClient.ensureQueryData(queryAcademiesDetail(academyUUID, enterpriseCustomer.uuid));

    return null;
  };
};

export default makeAcademiesLoader;
