import {
  makeCanRedeemQuery,
  makeCourseMetadataQuery,
  makeEnterpriseCourseEnrollmentsQuery,
  makeUserEntitlementsQuery,
} from '../queries';
import { ensureAuthenticatedUser, extractEnterpriseId } from '../data';

/**
 * Course loader for the course related page routes.
 * @param {Object} queryClient - The query client.
 * @returns {Function} - A loader function.
 */
export default function makeCourseLoader(queryClient) {
  return async function courseLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    const contentMetadataQuery = makeCourseMetadataQuery(enterpriseId, courseKey);

    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      queryClient.ensureQueryData(contentMetadataQuery).then((courseMetadata) => {
        if (!courseMetadata) {
          return null;
        }
        return queryClient.ensureQueryData(
          makeCanRedeemQuery(enterpriseId, courseMetadata),
        );
      }),
      // Fetch enterprise course enrollments.
      queryClient.ensureQueryData(makeEnterpriseCourseEnrollmentsQuery(enterpriseId)),
      // Fetch user entitlements.
      queryClient.ensureQueryData(makeUserEntitlementsQuery()),
    ]);

    return null;
  };
}
