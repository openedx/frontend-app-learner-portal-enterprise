import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { LICENSE_SUBSIDY_TYPE, PROMISE_FULFILLED } from './constants';

export default class CourseService {
  constructor(options = {}) {
    const {
      activeCourseRun,
      courseKey,
      enterpriseUuid,
    } = options;

    this.authenticatedHttpClient = getAuthenticatedHttpClient();

    this.courseKey = courseKey;
    this.enterpriseUuid = enterpriseUuid;
    this.activeCourseRun = activeCourseRun;
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
    const url = `${process.env.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchUserEnrollments() {
    // NOTE: this request url cannot use a trailing slash since it causes a 404
    const url = `${process.env.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchUserEntitlements() {
    const url = `${process.env.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchEnterpriseCustomerContainsContent() {
    const options = { course_run_ids: this.courseKey };
    const url = `${process.env.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${qs.stringify(options)}`;
    return this.authenticatedHttpClient.get(url);
  }

  async fetchAllEnterpriseUserSubsidies() {
    // TODO: this will likely be expanded to support codes/offers, by appending to
    // the below array to provide a function that makes the relevant API call(s)
    // for the specified subsidy type.
    //
    // note: these API calls should be ordered by priority. Example: if a user has
    // a license subsidy, we use that as the user's final subsidy. if not, we check
    // if the user has a code subsidy, and so on.
    const SUBSIDY_TYPES = [{
      type: LICENSE_SUBSIDY_TYPE,
      fetchFn: this.fetchUserLicenseSubsidy(),
    }];
    const promises = SUBSIDY_TYPES.map(subsidy => subsidy.fetchFn);
    // Promise.allSettled() waits until all promises are resolved, whether successful
    // or not. in contrast, Promise.all() immediately rejects when any promise errors
    // which is not ideal since if a user doesn't have a subsidy, the APIs may return
    // a non-200 status code.
    const data = await Promise.allSettled(promises);

    let userSubsidy = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i]?.status === PROMISE_FULFILLED) {
        const subsidyData = camelCaseObject(data[i].value.data);
        userSubsidy = { ...subsidyData, subsidyType: SUBSIDY_TYPES[i].type };

        // if a user subsidy is found, break early since the promises are priority ordered
        break;
      }
    }

    return userSubsidy;
  }

  fetchUserLicenseSubsidy() {
    const options = {
      enterprise_customer_uuid: this.enterpriseUuid,
      course_key: this.activeCourseRun.key,
    };
    const url = `${process.env.LICENSE_MANAGER_URL}/api/v1/license-subsidy/?${qs.stringify(options)}`;
    return this.authenticatedHttpClient.get(url);
  }
}
