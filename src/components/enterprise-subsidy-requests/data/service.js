import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { SUBSIDY_REQUEST_STATE } from '../../../constants';

export function fetchSubsidyRequestConfiguration(enterpriseUUID) {
  const url = `${getConfig().ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchLicenseRequests({
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
  return getAuthenticatedHttpClient().get(url);
}

export function fetchCouponCodeRequests({
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
  return getAuthenticatedHttpClient().get(url);
}

export function postCouponCodeRequest(enterpriseUUID, courseID) {
  const options = {
    enterprise_customer_uuid: enterpriseUUID,
    course_id: courseID,
  };
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/`;
  return getAuthenticatedHttpClient().post(url, options);
}

export function postLicenseRequest(enterpriseUUID, courseID) {
  const options = {
    enterprise_customer_uuid: enterpriseUUID,
    course_id: courseID,
  };
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/`;
  return getAuthenticatedHttpClient().post(url, options);
}
