import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

async function fetchSubscriptionLicensesForUser(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @returns
 * @param enterpriseUuid
 */
async function fetchSubscriptions(enterpriseUuid) {
  const response = await fetchSubscriptionLicensesForUser(enterpriseUuid);
  // Extracts customer agreement and removes it from the original response object
  const { customerAgreement } = response;
  delete response.customerAgreement;
  return {
    subscriptionLicenses: response,
    customerAgreement,
  };
}
export function makeSubscriptionsQuery(enterpriseUuid) {
  return {
    queryKey: ['enterprise', 'subscriptions', enterpriseUuid],
    queryFn: async () => fetchSubscriptions(enterpriseUuid),
    enabled: !!enterpriseUuid,
  };
}
