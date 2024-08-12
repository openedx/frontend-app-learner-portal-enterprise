import { queryLearnerPathwayProgressData } from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

type PathwayProgressRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly pathwayUUID: string;
};
interface PathwayProgressLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: PathwayProgressRouteParams;
}

const makePathwayProgressLoader: Types.MakeRouteLoaderFunctionWithQueryClient = (
  function makePathwayProgressLoader(queryClient) {
    return async function pathwayProgressLoader({ params, request }: PathwayProgressLoaderFunctionArgs) {
      const requestUrl = new URL(request.url);

      const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
      // User is not authenticated, so we can't do anything in this loader.
      if (!authenticatedUser) {
        return null;
      }

      const { pathwayUUID } = params;
      await queryClient.ensureQueryData(queryLearnerPathwayProgressData(pathwayUUID));

      return null;
    };
  }
);

export default makePathwayProgressLoader;
