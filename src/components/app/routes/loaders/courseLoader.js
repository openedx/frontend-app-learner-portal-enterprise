import {
  queryUserEntitlements,
  queryCanRedeem,
  queryCourseMetadata,
  queryEnterpriseCourseEnrollments,
} from '../data/queries';
import { ensureAuthenticatedUser, extractEnterpriseId } from '../data';

/**
 * Course loader for the course related page routes.
 * @param {Object} queryClient - The query client.
 * @returns {Function} - A loader function.
 */
export default function makeCourseLoader(queryClient) {
  return async function courseLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const contentMetadataQuery = queryCourseMetadata(enterpriseId, courseKey);

    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      queryClient.ensureQueryData(contentMetadataQuery).then((courseMetadata) => {
        if (!courseMetadata) {
          return null;
        }
        return queryClient.ensureQueryData(
          queryCanRedeem(enterpriseId, courseMetadata),
        );
      }),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId)),
      queryClient.ensureQueryData(queryUserEntitlements()),
    ]);

    return null;
  };
}
