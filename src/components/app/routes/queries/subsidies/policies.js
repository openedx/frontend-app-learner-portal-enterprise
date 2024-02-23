import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { enterpriseQueryKeys } from "../../../../../utils/react-query-factory";

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userID
 * @returns
 */
async function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export function makeRedeemablePoliciesQuery({ enterpriseUuid, lmsUserId }) {
  return {
    queryKey: enterpriseQueryKeys.redeemablePolicies(enterpriseUuid, lmsUserId),
    queryFn: async () => fetchRedeemablePolicies(enterpriseUuid, lmsUserId),
    enabled: !!enterpriseUuid,
  };
}
