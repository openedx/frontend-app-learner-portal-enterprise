import qs from 'query-string';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import { hasValidStartExpirationDates } from '../../../utils/common';
import { LICENSE_SUBSIDY_TYPE, OFFER_SUBSIDY_TYPE, PROMISE_FULFILLED } from './constants';
import { getActiveCourseRun, getAvailableCourseRuns, findOfferForCourse } from './utils';

export default class CourseService {
  constructor(options = {}) {
    const {
      activeCourseRun,
      courseKey,
      courseRunKey,
      enterpriseUuid,
    } = options;
    this.config = getConfig();

    this.authenticatedHttpClient = getAuthenticatedHttpClient();
    this.cachedAuthenticatedHttpClient = getAuthenticatedHttpClient({
      useCache: this.config.USE_API_CACHE,
    });

    this.courseKey = courseKey;
    this.courseRunKey = courseRunKey;
    this.enterpriseUuid = enterpriseUuid;
    this.activeCourseRun = activeCourseRun;
  }

  async fetchAllCourseData({ offers }) {
    const data = await Promise.all([
      this.fetchCourseDetails(),
      this.fetchUserEnrollments(),
      this.fetchUserEntitlements(),
      this.fetchEnterpriseCustomerContainsContent(),
    ])
      .then((responses) => responses.map(response => response.data));

    const courseDetails = camelCaseObject(data[0]);
    // Get the user subsidy (by license, codes, or any other means) that the user may have for the active course run
    this.activeCourseRun = this.activeCourseRun || getActiveCourseRun(courseDetails);

    const { catalogList } = camelCaseObject(data[3]);
    const userSubsidyApplicableToCourse = await this.fetchEnterpriseUserSubsidy({
      offers, catalogList,
    });

    // Check for the course_run_key URL param and remove all other course run data
    // if the given course run key is for an available course run.
    if (this.courseRunKey) {
      const availableCourseRuns = getAvailableCourseRuns(courseDetails);
      const availableCourseRunKeys = availableCourseRuns.map(({ key }) => key);
      if (availableCourseRunKeys.includes(this.courseRunKey)) {
        courseDetails.canonicalCourseRunKey = this.courseRunKey;
        courseDetails.courseRunKeys = [this.courseRunKey];
        courseDetails.courseRuns = availableCourseRuns.filter(obj => obj.key === this.courseRunKey);
        courseDetails.advertisedCourseRunUuid = courseDetails.courseRuns[0].uuid;
      }
    }

    return {
      courseDetails,
      userSubsidyApplicableToCourse,
      userEnrollments: data[1],
      userEntitlements: data[2].results,
      catalog: data[3],
    };
  }

  fetchCourseDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserEnrollments() {
    // NOTE: this request url cannot use a trailing slash since it causes a 404
    const url = `${this.config.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchUserEntitlements() {
    const url = `${this.config.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchEnterpriseCustomerContainsContent() {
    const options = { course_run_ids: this.courseKey, get_catalog_list: true };
    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${qs.stringify(options)}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  async fetchEnterpriseUserSubsidy({ offers, catalogList }) {
    // TODO: this will likely be expanded to support codes/offers, by appending to
    // the below array to provide a function that makes the relevant API call(s)
    // for the specified subsidy type.
    //
    // note: these API calls should be ordered by priority. Example: if a user has
    // a license subsidy, we use that as the user's final subsidy. if not, we check
    // if the user has a code subsidy, and so on.
    const SUBSIDY_TYPES = [
      {
        type: LICENSE_SUBSIDY_TYPE,
        fetchFn: this.fetchUserLicenseSubsidy(),
      },
      {
        type: OFFER_SUBSIDY_TYPE,
        fetchFn: this.fetchUserOfferSubsidy({ offers, catalogList }),
      },
    ];
    const promises = SUBSIDY_TYPES.map(subsidy => subsidy.fetchFn);
    // Promise.allSettled() waits until all promises are resolved, whether successful
    // or not. in contrast, Promise.all() immediately rejects when any promise errors
    // which is not ideal since if a user doesn't have a subsidy, the APIs may return
    // a non-200 status code.
    const data = await Promise.allSettled(promises);

    let userSubsidyApplicableToCourse = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i]?.status === PROMISE_FULFILLED) {
        const result = data[i].value.data;
        const subsidyData = camelCaseObject(result);

        if (hasValidStartExpirationDates(subsidyData)) {
          userSubsidyApplicableToCourse = { ...subsidyData, subsidyType: SUBSIDY_TYPES[i].type };
          // if a non-expired user subsidy is found, break early since the promises
          // are priority ordered
          break;
        }
      }
    }

    return userSubsidyApplicableToCourse;
  }

  fetchUserLicenseSubsidy() {
    const options = {
      enterprise_customer_uuid: this.enterpriseUuid,
      course_key: this.activeCourseRun.key,
    };
    const url = `${this.config.LICENSE_MANAGER_URL}/api/v1/license-subsidy/?${qs.stringify(options)}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserOfferSubsidy({ offers, catalogList }) {
    // TODO this probably should be a fetch but we are using prefetch offer data here
    /*
      benefit_value: 100
      catalog: "09a6dd6a-a6f0-4232-aaca-3bd1d81a4197"
      code: "3K64Q2MP6VYAWFJ5"
      coupon_end_date: "2025-09-24T00:00:00Z"
      coupon_start_date: "2020-09-24T00:00:00Z"
      redemptions_remaining: 1
      usage_type: "Percentage"
      */
    const offerForCourse = findOfferForCourse(offers, catalogList);
    const {
      usageType, benefitValue, couponStartDate, couponEndDate,
    } = offerForCourse;
    return Promise.resolve({
      data: {
        discountType: usageType,
        discountValue: benefitValue,
        startDate: couponStartDate,
        endDate: couponEndDate,
      },
    });
  }
}
