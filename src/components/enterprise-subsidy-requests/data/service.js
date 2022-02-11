import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export function fetchSubsidyRequestConfiguration(enterpriseUUID, useCache = true) {
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_API_BASE_URL}/api/v1/customer-configurations/${enterpriseUUID}/`;
  return getAuthenticatedHttpClient({
    useCache: useCache && config.USE_API_CACHE,
  }).get(url);
}

export function fetchLicenseRequests(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_API_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchCouponCodeRequests(enterpriseUUID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_API_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
  return getAuthenticatedHttpClient().get(url);
}
