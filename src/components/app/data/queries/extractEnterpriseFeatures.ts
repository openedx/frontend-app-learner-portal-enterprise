import { queryEnterpriseLearner } from './queries';

interface ExtractEnterpriseCustomerArgs {
  queryClient: Types.QueryClient;
  authenticatedUser: Types.AuthenticatedUser;
  enterpriseSlug?: string;
}

/**
 * Extracts the enterpriseFeatures from the enterpriseLearnerData for the current user and enterprise slug.
 */
async function extractEnterpriseFeatures({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
} : ExtractEnterpriseCustomerArgs) : Promise<Types.EnterpriseFeatures> {
  // Retrieve linked enterprise customers for the current user from query cache, or
  // fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);
  const enterpriseLearnerData = await queryClient.ensureQueryData<Types.EnterpriseLearnerData>(
    linkedEnterpriseCustomersQuery,
  );
  const { enterpriseFeatures } = enterpriseLearnerData;
  return enterpriseFeatures;
}

export default extractEnterpriseFeatures;
