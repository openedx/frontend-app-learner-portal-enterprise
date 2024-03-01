import {
  ensureAuthenticatedUser,
  extractEnterpriseId,
  queryEnterpriseCourseEnrollments,
} from '../data';

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
    await queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId));
    return null;
  };
}
