import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  extractEnterpriseId,
  queryEnterpriseCourseEnrollments,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryEnterpriseGroupMemberships,
} from '../../app/data';

/**
 * Returns a loader function responsible for loading the dashboard related data.
 * @param {object} queryClient - The query client.
 * @returns {Promise} A loader function.
 */
export default function makeDashboardLoader(queryClient) {
  return async function dashboardLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { enterpriseSlug } = params;
    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    await Promise.all([
      queryClient.ensureQueryData(queryEnterpriseGroupMemberships(enterpriseId, authenticatedUser.email)),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId)),
      queryClient.ensureQueryData(queryEnterpriseProgramsList(enterpriseId)),
      queryClient.ensureQueryData(queryEnterprisePathwaysList(enterpriseId)),
    ]);

    return null;
  };
}
