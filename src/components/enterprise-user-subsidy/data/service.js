import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchSubscriptionLicensesForUser(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchCustomerAgreementData(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/customer-agreement/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function requestAutoAppliedLicense(customerAgreementId) {
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/customer-agreement/${customerAgreementId}/auto-apply/`;
  return getAuthenticatedHttpClient().post(url);
}

export const fetchEnterpriseCatalogData = (uuid) => {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/dojo_enterprise_catalog/api/catalog/${uuid}/`;
  return getAuthenticatedHttpClient().get(url);
};
