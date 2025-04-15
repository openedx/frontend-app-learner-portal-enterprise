import { LoaderFunctionArgs, Params } from 'react-router-dom';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryCourseMetadata,
  queryCourseReviews,
  queryVideoDetail,
  safeEnsureQueryData,
} from '../../app/data';
import { getErrorResponseStatusCode } from '../../../utils/common';

type VideoRouteParams<Key extends string = string> = Params<Key> & {
  readonly videoUUID: string;
  readonly enterpriseSlug: string;
};
interface VideoLoaderFunctionArgs extends LoaderFunctionArgs {
  params: VideoRouteParams;
}

const makeVideosLoader: MakeRouteLoaderFunctionWithQueryClient = function makeVideosLoader(queryClient) {
  return async function videosLoader({ params, request } : VideoLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { videoUUID, enterpriseSlug } = params;
    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }

    const videoData = await queryClient.ensureQueryData(queryVideoDetail(videoUUID, enterpriseCustomer.uuid));
    if (videoData) {
      const { courseKey } = videoData;
      await Promise.all([
        safeEnsureQueryData({
          queryClient,
          query: queryCourseMetadata(courseKey),
          fallbackData: null,
        }),
        safeEnsureQueryData({
          queryClient,
          query: queryCourseReviews(courseKey),
          shouldLogError: (error) => getErrorResponseStatusCode(error) !== 404,
          fallbackData: null,
        }),
      ]);
    }

    return null;
  };
};

export default makeVideosLoader;
