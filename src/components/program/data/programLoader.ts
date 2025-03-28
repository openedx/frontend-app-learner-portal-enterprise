import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryEnterpriseProgram } from '../../app/data';

type ProgramRouteParams<Key extends string = string> = RouteParams<Key> & {
  readonly programUUID: string;
  readonly enterpriseSlug: string;
};
interface ProgramLoaderFunctionArgs extends RouteLoaderFunctionArgs {
  params: ProgramRouteParams;
}

const makeProgramLoader: MakeRouteLoaderFunctionWithQueryClient = function makeProgramLoader(queryClient) {
  return async function programLoader({ params, request }: ProgramLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug, programUUID } = params;

    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }
    await queryClient.ensureQueryData(queryEnterpriseProgram(enterpriseCustomer.uuid, programUUID));

    return null;
  };
};

export default makeProgramLoader;
