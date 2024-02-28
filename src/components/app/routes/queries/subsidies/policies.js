import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userID
 * @returns
 */
export async function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}
