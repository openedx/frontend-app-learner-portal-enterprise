import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { loginRefresh } from '../../../utils/common';

export function fetchSubscriptionLicensesForUser(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    include_revoked: true,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/learner-licenses/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export async function activateLicense(activationKey) {
  const config = getConfig();

  // If the user has not refreshed their JWT since they created their account,
  // we should refresh it so that they'll have appropriate roles (if available),
  // and thus, have any appropriate permissions when making downstream requests.
  loginRefresh();

  const queryParams = new URLSearchParams({ activation_key: activationKey });
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/license-activation/?${queryParams.toString()}`;

  return getAuthenticatedHttpClient().post(url);
}

export function fetchCustomerAgreementData(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.LICENSE_MANAGER_URL}/api/v1/customer-agreement/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchRedeemableLearnerCreditPolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}
