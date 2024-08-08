// In `videos/index.js` or another relevant file
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryVideoDetail } from '../../app/data';

type VideoRouteParams<Key extends string = string> = Types.RouteParams<Key> & {
  readonly videoUUID: string;
  readonly enterpriseSlug: string;
};
interface VideoLoaderFunctionArgs extends Types.RouteLoaderFunctionArgs {
  params: VideoRouteParams;
}

const makeVideoLoader: Types.MakeRouteLoaderFunction = function makeVideoLoader(queryClient) {
  return async function videosLoader({ params, request } : VideoLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated or no query client is provided, so we can't do anything in this loader.
    if (!authenticatedUser || !queryClient) {
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

export default makeVideoLoader;
