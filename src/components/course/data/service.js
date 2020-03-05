import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export function fetchCourseDetails(courseKey) {
  const url = `${process.env.DISCOVERY_API_URL}/v1/courses/${courseKey}`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchUserEnrollments() {
  const url = `${process.env.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
  return getAuthenticatedHttpClient().get(url);
}

export function fetchUserEntitlements() {
  const url = `${process.env.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
  return getAuthenticatedHttpClient().get(url);
}

export function enrollUser(data) {
  const url = `${process.env.LMS_BASE_URL}/api/commerce/v0/baskets/`;
  return getAuthenticatedHttpClient().post(url, data);
}

export function fetchEnterpriseCustomerContainsContent({
  enterpriseUuid,
  courseKey,
}) {
  const options = {
    course_run_ids: courseKey,
  };
  const url = `${process.env.ENTERPRISE_CATALOG_API_URL}/v1/enterprise-customer/${enterpriseUuid}/contains_content_items/?${qs.stringify(options)}`;
  return getAuthenticatedHttpClient().get(url);
}
