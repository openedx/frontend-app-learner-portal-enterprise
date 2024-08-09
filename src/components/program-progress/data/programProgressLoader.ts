import { queryLearnerProgramProgressData } from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

type ProgramProgressRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly programUUID: string;
};
interface ProgramProgressLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: ProgramProgressRouteParams;
}

const makeProgramProgressLoader: Types.MakeRouteLoaderFunction = function makeProgramProgressLoader(queryClient) {
  return async function programProgressLoader({ params, request }: ProgramProgressLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);

    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated or no query client is provided, so we can't do anything in this loader.
    if (!authenticatedUser || !queryClient) {
      return null;
    }

    const { programUUID } = params;
    await queryClient.ensureQueryData(queryLearnerProgramProgressData(programUUID));

    return null;
  };
};

export default makeProgramProgressLoader;
