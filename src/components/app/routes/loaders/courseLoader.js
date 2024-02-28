import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import {
  makeUserEntitlementsQuery,
  queryCanRedeem,
  queryCourseMetadata,
  queryEnterpriseCourseEnrollments,
} from '../data/services';

import extractEnterpriseId from './extractEnterpriseId';

/**
 * TODO
 * @param {*} queryClient
 * @returns
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
      queryClient.ensureQueryData(contentMetadataQuery).then((courseMetadata) => {
        if (!courseMetadata) {
          return null;
        }
        return queryClient.ensureQueryData(
          queryCanRedeem(enterpriseId, courseMetadata),
        );
      }),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId)),
      queryClient.ensureQueryData(makeUserEntitlementsQuery()),
    ]);

    return null;
  };
}
