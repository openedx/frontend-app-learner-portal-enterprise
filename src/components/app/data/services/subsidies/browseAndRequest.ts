import type { AxiosResponse } from 'axios';
import { CamelCasedPropertiesDeep } from 'type-fest';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';

import { SUBSIDY_REQUEST_STATE } from '../../../../../constants';
import { fetchPaginatedData } from '../utils';

type BrowseAndRequestConfigurationAxiosResponseRaw = AxiosResponse<BrowseAndRequestConfigurationResponseRaw>;
type BrowseAndRequestConfigurationAxiosResponseDataRaw = BrowseAndRequestConfigurationAxiosResponseRaw['data'];
type BrowseAndRequestConfigurationAxiosResponseData = (
  CamelCasedPropertiesDeep<BrowseAndRequestConfigurationAxiosResponseDataRaw>
);

/**
 * TODO
 * @param {*} enterpriseUUID
 * @returns
 */
export async function fetchBrowseAndRequestConfiguration(enterpriseUUID) {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  const response: AxiosResponse<BrowseAndRequestConfigurationResponseRaw> = await getAuthenticatedHttpClient().get(url);
  return camelCaseObject(response.data) as BrowseAndRequestConfigurationAxiosResponseData;
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
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  const { results } = await fetchPaginatedData<LicenseRequestRaw>(url);
  return results;
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
  const { results } = await fetchPaginatedData<CouponCodeRequestRaw>(url);
  return results;
}

/**
 * Fetches learner credit requests for the given enterprise and user.
 * @param {*} enterpriseUUID
 * @param {*} userEmail
 * @param {*} state
 * @returns
 */
export async function fetchLearnerCreditRequests(
  enterpriseUUID,
  userEmail,
  state?: SubsidyRequestState,
) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    user__email: userEmail,
  });
  if (state) {
    queryParams.append('state', state);
  }
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/learner-credit-requests/?${queryParams.toString()}`;
  const { results } = await fetchPaginatedData<LearnerCreditRequestRaw>(url);
  return results;
}
