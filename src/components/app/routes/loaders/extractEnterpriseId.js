import { queryEnterpriseLearner } from '../queries';

export default async function extractEnterpriseId({
  queryClient,
  authenticatedUser,
  enterpriseSlug,
}) {
  // Retrieve linked enterprise customers for the current user from query cache
  // or fetch from the server if not available.
  const linkedEnterpriseCustomersQuery = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);
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
