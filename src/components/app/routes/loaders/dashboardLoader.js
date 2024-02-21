import { extractActiveEnterpriseId, makeEnterpriseCourseEnrollmentsQuery } from './courseLoader';
import ensureAuthenticatedUser from './ensureAuthenticatedUser';

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeDashboardLoader(queryClient) {
  return async function dashboardLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { enterpriseSlug } = params;
    const enterpriseId = await extractActiveEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    await queryClient.fetchQuery(makeEnterpriseCourseEnrollmentsQuery(enterpriseId));
    return null;
  };
}