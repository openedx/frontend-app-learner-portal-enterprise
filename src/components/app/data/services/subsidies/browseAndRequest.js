import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';

import { getErrorResponseStatusCode } from '../../../../../utils/common';
import { SUBSIDY_REQUEST_STATE } from '../../../../../constants';

/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchBrowseAndRequestConfiguration(enterpriseUUID) {
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
}

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userEmail
 * @param {*} state
 * @returns
 */
export async function fetchLicenseRequests(
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
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

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userEmail
 * @param {*} state
 * @returns
 */
export async function fetchCouponCodeRequests(
  enterpriseUUID,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
) {
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
