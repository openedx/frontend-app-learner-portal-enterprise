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

const transformSubscriptionLicenseResponse = (response) => {
  // Deep copies the response from learner-licenses
  const subscriptionLicenses = structuredClone(response);
  // Create and assign the customer agreement object
  const customerAgreement = {
    results: [response.results[0].customerAgreement],
  };
  // Create subscriptions object
  const subscriptions = {
    ...subscriptionLicenses,
    results: [],
  };
  // Pushes each subscriptions results and removes the
  // sub plan and customer agreement from the subscriptionLicenses object
  subscriptionLicenses.results.forEach((license, index) => {
    subscriptions.results.push(license.subscriptionPlan);
    delete subscriptionLicenses.results[index].subscriptionPlan;
    delete subscriptionLicenses.results[index].customerAgreement;
  });
  return {
    subscriptionLicenses,
    customerAgreement,
    subscriptions,
  };
};

/**
 * TODO
 * @param {*} param0
 * @returns
 */
async function fetchSubscriptions(enterpriseUuid) {
  const response = await fetchSubscriptionLicensesForUser(enterpriseUuid);
  const { subscriptions, customerAgreement, subscriptionLicenses } = transformSubscriptionLicenseResponse(response);
  return {
    subscriptions,
    customerAgreement,
    subscriptionLicenses,
  };
}

export function makeSubscriptionsQuery(enterpriseUuid) {
  return {
    queryKey: ['enterprise', 'subscriptions', enterpriseUuid],
    queryFn: async () => fetchSubscriptions(enterpriseUuid),
    enabled: !!enterpriseUuid,
  };
}
