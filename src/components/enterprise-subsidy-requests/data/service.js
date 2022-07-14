import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { SUBSIDY_REQUEST_STATE } from '../constants';

export function fetchSubsidyRequestConfiguration(enterpriseId) {
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${enterpriseId}/`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchLicenseRequests({
  enterpriseId,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseId,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchCouponCodeRequests({
  enterpriseId,
  userEmail,
  state = SUBSIDY_REQUEST_STATE.REQUESTED,
}) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseId,
    user__email: userEmail,
    state,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function postCouponCodeRequest(enterpriseId, courseID) {
  const options = {
    enterprise_customer_uuid: enterpriseId,
    course_id: courseID,
  };
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/`;
  return getAuthenticatedHttpClient().post(url, options);
}

export function postLicenseRequest(enterpriseId, courseID) {
  const options = {
    enterprise_customer_uuid: enterpriseId,
    course_id: courseID,
  };
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/`;
  return getAuthenticatedHttpClient().post(url, options);
}
