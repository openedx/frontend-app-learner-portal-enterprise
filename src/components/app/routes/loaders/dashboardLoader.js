// import { makeEnterpriseCourseEnrollmentsQuery } from '../queries';
import { extractActiveEnterpriseId } from './courseLoader';
import ensureAuthenticatedUser from './ensureAuthenticatedUser';
import { makeEnterpriseCourseEnrollmentsQuery } from '../data/services';

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
    await queryClient.ensureQueryData(makeEnterpriseCourseEnrollmentsQuery(enterpriseId));
    return null;
  };
}
