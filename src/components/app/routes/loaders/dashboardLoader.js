import { makeEnterpriseCourseEnrollmentsQuery } from '../queries';
import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import extractEnterpriseId from './extractEnterpriseId';

/**
 * TODO
 * @param {*} queryClient
 * @returns
 */
export default function makeDashboardLoader(queryClient) {
  return async function dashboardLoader({ params = {} }) {
    const authenticatedUser = await ensureAuthenticatedUser();
    const { enterpriseSlug } = params;
    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    await queryClient.ensureQueryData(makeEnterpriseCourseEnrollmentsQuery(enterpriseId));
    return null;
  };
}
