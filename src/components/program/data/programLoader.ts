import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryEnterpriseProgram } from '../../app/data';

type ProgramRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly programUUID: string;
  readonly enterpriseSlug: string;
};
interface ProgramLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: ProgramRouteParams;
}

const makeProgramLoader: Types.MakeRouteLoaderFunction = function makeProgramLoader(queryClient) {
  return async function programLoader({ params, request }: ProgramLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated or no query client is provided, so we can't do anything in this loader.
    if (!authenticatedUser || !queryClient) {
      return null;
    }

    const { enterpriseSlug, programUUID } = params;

    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    await queryClient.ensureQueryData(queryEnterpriseProgram(enterpriseCustomer.uuid, programUUID));

    return null;
  };
};

export default makeProgramLoader;
