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
    const courseDataRaw = await Promise.all([
      this.fetchCourseDetails(),
      this.fetchUserEnrollments(),
      this.fetchUserEntitlements(),
      this.fetchEnterpriseCustomerContainsContent(),
    ])
      .then((responses) => responses.map(res => res.data));

    const courseData = camelCaseObject(courseDataRaw);
    const courseDetails = courseData[0];
    // Get the user subsidy (by license, codes, or any other means) that the user may have for the active course run
    this.activeCourseRun = this.activeCourseRun || getActiveCourseRun(courseDetails);

    const { catalogList } = courseData[3];
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
      userEnrollments: courseData[1],
      userEntitlements: courseData[2].results,
      catalog: courseData[3],
    };
  }

  fetchCourseDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserEnrollments() {
    const queryParams = {
      enterprise_id: this.enterpriseUuid,
      is_active: true,
    };
    const config = getConfig();
    const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${qs.stringify(queryParams)}`;
    return getAuthenticatedHttpClient().get(url);
  }

  fetchUserEntitlements() {
    const url = `${this.config.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchEnterpriseCustomerContainsContent() {
    // This API call will *only* obtain the enterprise's catalogs whose
    // catalog queries return/contain the specified courseKey.
    const options = {
      course_run_ids: this.courseKey,
      get_catalogs_containing_specified_content_ids: true,
    };
    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${qs.stringify(options)}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  async fetchEnterpriseUserSubsidy({ offers, catalogList }) {
    // TODO: the license subsidy is fetched from backend, but the offer subsidy currently is being
    //   used from the passed in arguments (fetched already by UserSubsidy.jsx).
    //  Need to reconcile api to make it consistent for all subsidy types: offers, subscriptions
    //
    // Note: these API calls should be ordered by priority. Example: if a user has
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

  /**
   * @typedef {Object} Offer An offer for a course
   * @property {string} usageType
   * @property {number} benefitValue
   * @property {string} couponStartDate utc formatted
   * @property {string} couponEndDate utc formatted
   * @property {number} redemptionsRemaining
   * @property {string} code
   * @property {string} catalog uuid of catalog
   */

  /**
   * Returns an offer whose catalog uuid matches one of the provided catalogs.
   * TODO: This method currently cannot discover if the offer applies specifically
   * to a course, just that there is an offer that matches one in the list of catalogs.
   * @param {Object} args Arguments
   * @param {Array<Offer>} args.offers All offers for this user for an enterprise
   *
   * @returns {Promise} a promise that resolves to an object matching userSubsidyApplicableToCourse
   */
  fetchUserOfferSubsidy({ offers, catalogList }) {
    const offerForCourse = findOfferForCourse(offers, catalogList);
    if (!offerForCourse) {
      return Promise.reject(new Error('No offer found'));
    }
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
