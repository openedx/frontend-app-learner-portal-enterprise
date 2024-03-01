import { ensureAuthenticatedUser, extractEnterpriseId } from '../data';
import { queryEnterpriseCourseEnrollments } from '../queries';

/**
 * Returns a loader function responsible for loading the dashboard related data.
 * @param {object} queryClient - The query client.
 * @returns {Promise} A loader function.
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
    await queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId));
    return null;
  };
}
