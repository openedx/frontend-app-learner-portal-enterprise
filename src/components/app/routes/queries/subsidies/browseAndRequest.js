import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getErrorResponseStatusCode } from '../../../../../utils/common';
import { SUBSIDY_REQUEST_STATE } from '../../../../enterprise-subsidy-requests';

/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
const fetchSubsidyRequestConfiguration = async (enterpriseUUID) => {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    const errorResponseStatusCode = getErrorResponseStatusCode(error);
    if (errorResponseStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

async function fetchLicenseRequests({
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

async function fetchCouponCodeRequests({
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data);
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export async function fetchBrowseAndRequestConfiguration(enterpriseUuid, userEmail) {
  const results = await Promise.all([
    fetchSubsidyRequestConfiguration(enterpriseUuid),
    fetchCouponCodeRequests({
      enterpriseUUID: enterpriseUuid,
      userEmail,
    }),
    fetchLicenseRequests({
      enterpriseUUID: enterpriseUuid,
      userEmail,
    }),
  ]);

  return {
    subsidyRequestConfiguration: results[0],
    couponCodeRequests: results[1],
    licenseRequests: results[2],
  };
}

// export function makeBrowseAndRequestConfigurationQuery(enterpriseUuid, userEmail) {
//   return {
//     queryKey: enterpriseQueryKeys.browseAndRequestConfiguration(enterpriseUuid, userEmail),
//     queryFn: async () => fetchBrowseAndRequestConfiguration(enterpriseUuid, userEmail),
//     enabled: !!enterpriseUuid,
//   };
// }
