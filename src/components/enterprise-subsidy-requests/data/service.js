import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

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

export function postLearnerCreditRequest(
  enterpriseUUID,
  policyUUID,
  courseKey,
  coursePrice
) {
  const options = {
    enterprise_customer_uuid: enterpriseUUID,
    policy_uuid: policyUUID,
    course_id: courseKey,
    course_price: coursePrice,
  };
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/learner-credit-requests/`;
  return getAuthenticatedHttpClient().post(url, options);
}
