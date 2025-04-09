import { queryEnterpriseLearner } from './queries';

interface ExtractEnterpriseCustomerArgs {
  queryClient: QueryClient;
  authenticatedUser: AuthenticatedUser;
  enterpriseSlug?: string;
}

/**
 * Extracts the enterpriseFeatures from the enterpriseLearnerData for the current user and enterprise slug.
 */
async function extractEnterpriseFeatures({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
} : ExtractEnterpriseCustomerArgs) : Promise<EnterpriseFeatures> {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);
  try {
    const enterpriseLearnerData = await queryClient.ensureQueryData(
      linkedEnterpriseCustomersQuery,
    );
    const { enterpriseFeatures } = enterpriseLearnerData;
    return enterpriseFeatures;
  } catch (error) {
    return {} as EnterpriseFeatures;
  }
}

export default extractEnterpriseFeatures;
