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

async function fetchCustomerAgreementData(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/customer-agreement/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchSubscriptions(enterpriseUuid) {
  const results = await Promise.all([
    fetchCustomerAgreementData(enterpriseUuid),
    fetchSubscriptionLicensesForUser(enterpriseUuid),
  ]);
  return {
    customerAgreement: results[0],
    subscriptionLicenses: results[1],
  };
}
