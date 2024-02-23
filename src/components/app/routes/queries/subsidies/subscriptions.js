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
 * @param {*} param0
 * @returns
 */
async function fetchSubscriptions(enterpriseUuid) {
  const response = await fetchSubscriptionLicensesForUser(enterpriseUuid);

  // Refactor response to match current state of the world before
  // reintegrating components
  const customerAgreement = {
    ...response,
    results: [response.results[0].customerAgreement],
  };
  customerAgreement.results[0].subscriptionPlan = response.results[0].subscriptionPlan;
  delete response.results[0].subscriptionPlan;
  delete response.results[0].customerAgreement;

  console.log(customerAgreement, response)
  return {
    customerAgreement,
    subscriptionLicenses: response,
  };
}

export function makeSubscriptionsQuery(enterpriseUuid) {
  return {
    queryKey: ['enterprise', 'subscriptions', enterpriseUuid],
    queryFn: async () => fetchSubscriptions(enterpriseUuid),
    enabled: !!enterpriseUuid,
  };
}
