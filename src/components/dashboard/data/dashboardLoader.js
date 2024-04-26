import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
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
    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    await Promise.all([
      queryClient.ensureQueryData(queryEnterpriseGroupMemberships(enterpriseCustomer.uuid, authenticatedUser.email)),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterpriseProgramsList(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterprisePathwaysList(enterpriseCustomer.uuid)),
    ]);

    return null;
  };
}
