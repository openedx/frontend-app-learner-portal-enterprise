import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export default class CourseService {
  constructor(options = {}) {
    const { courseKey, enterpriseUuid } = options;

    this.authenticatedHttpClient = getAuthenticatedHttpClient();

    if (courseKey && enterpriseUuid) {
      this.courseKey = courseKey;
      this.enterpriseUuid = enterpriseUuid;
    }
  }

  async fetchAllCourseData() {
    const data = await Promise.all([
      this.fetchCourseDetails(),
      this.fetchUserEnrollments(),
      this.fetchUserEntitlements(),
      this.fetchEnterpriseCustomerContainsContent(),
    ])
      .then((responses) => responses.map(response => response.data));

    return {
      courseDetails: data[0],
      userEnrollments: data[1],
      userEntitlements: data[2].results,
      catalog: data[3],
    };
  }

  fetchCourseDetails() {
    const url = `${process.env.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchUserEnrollments() {
    const url = `${process.env.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchUserEntitlements() {
    const url = `${process.env.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchEnterpriseCustomerContainsContent() {
    const options = { course_run_ids: this.courseKey };
    const url = `${process.env.ENTERPRISE_CATALOG_API_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${qs.stringify(options)}`;
    return this.authenticatedHttpClient.get(url);
  }

  enrollUser(data) {
    const url = `${process.env.LMS_BASE_URL}/api/commerce/v0/baskets/`;
    return this.authenticatedHttpClient.post(url, data);
  }
}
