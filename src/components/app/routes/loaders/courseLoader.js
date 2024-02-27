import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import {
  makeUserEntitlementsQuery,
  makeCanRedeemQuery,
  makeCourseMetadataQuery,
  makeEnterpriseCourseEnrollmentsQuery,
  makeEnterpriseLearnerQuery,
} from '../data/services';


// TODO: abstract out somewhere more common
export async function extractActiveEnterpriseId({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
}) {
  // Retrieve linked enterprise customers for the current user from query cache
  // or fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = makeEnterpriseLearnerQuery(authenticatedUser.username, enterpriseSlug);
  const enterpriseLearnerData = await queryClient.ensureQueryData(linkedEnterpriseCustomersQuery);
  const {
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
  } = enterpriseLearnerData;

  if (!enterpriseSlug) {
    return activeEnterpriseCustomer.uuid;
  }

  const foundEnterpriseIdForSlug = allLinkedEnterpriseCustomerUsers.find(
    (enterpriseCustomerUser) => enterpriseCustomerUser.enterpriseCustomer.slug === enterpriseSlug,
  )?.enterpriseCustomer.uuid;

  if (foundEnterpriseIdForSlug) {
    return foundEnterpriseIdForSlug;
  }

  throw new Error(`Could not find enterprise customer for user ${authenticatedUser.userId} and slug ${enterpriseSlug}`);
}

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeCourseLoader(queryClient) {
  return async function courseLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractActiveEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const contentMetadataQuery = makeCourseMetadataQuery(enterpriseId, courseKey);

    await Promise.all([
      queryClient.ensureQueryData(contentMetadataQuery).then((courseMetadata) => {
        if (!courseMetadata) {
          return null;
        }
        return queryClient.ensureQueryData(
          makeCanRedeemQuery(enterpriseId, courseMetadata),
        );
      }),
      queryClient.ensureQueryData(makeEnterpriseCourseEnrollmentsQuery(enterpriseId)),
      queryClient.ensureQueryData(makeUserEntitlementsQuery()),
    ]);

    return null;
  };
}
