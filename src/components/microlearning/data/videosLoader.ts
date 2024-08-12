import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryVideoDetail } from '../../app/data';

type VideoRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly videoUUID: string;
  readonly enterpriseSlug: string;
};
interface VideoLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: VideoRouteParams;
}

const makeVideosLoader: Types.MakeRouteLoaderFunctionWithQueryClient = function makeVideosLoader(queryClient) {
  return async function videosLoader({ params, request } : VideoLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { videoUUID, enterpriseSlug } = params;
    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    await queryClient.ensureQueryData(queryVideoDetail(videoUUID, enterpriseCustomer.uuid));

    return null;
  };
};

export default makeVideosLoader;
