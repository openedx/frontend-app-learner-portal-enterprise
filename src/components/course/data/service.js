import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';

import { getActiveCourseRun, getAvailableCourseRuns } from './utils';

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

  async fetchAllCourseData() {
    const courseDataRaw = await Promise.all([
      this.fetchCourseDetails(),
      this.fetchUserEnrollments(),
      this.fetchUserEntitlements(),
      this.fetchEnterpriseCustomerContainsContent(),
    ]).then((responses) => responses.map(res => res.data));

    const courseData = camelCaseObject(courseDataRaw);
    const courseDetails = courseData[0];
    // Get the user subsidy (by license, codes, or any other means) that the user may have for the active course run
    this.activeCourseRun = this.activeCourseRun || getActiveCourseRun(courseDetails);

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
      userEnrollments: courseData[1],
      userEntitlements: courseData[2].results,
      catalog: courseData[3],
    };
  }

  async fetchAllCourseRecommendations() {
    const response = await this.fetchCourseRecommendations();
    // TODO: Filter recommendations on catalogs basis ENT-5735
    /*
    const allRecommendations = response.data.all_recommendations.map(rec=>rec.key);
    const samePartRecommendations = response.data.same_partner_recommendations.map(rec=>rec.key);

    if (allRecommendations.length>0) {
      const filteredAllRecommendations = await this.fetchFilteredRecommendations(allRecommendations);
    }
    if (samePartRecommendations.length>0) {
      const filteredSamePartRecommendations = await this.fetchFilteredRecommendations(samePartRecommendations);
    }
    */
    return response.data;
  }

  fetchCourseDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchCourseRecommendations() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/course_recommendations/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserEnrollments() {
    const queryParams = new URLSearchParams({
      enterprise_id: this.enterpriseUuid,
      is_active: true,
    });
    const config = getConfig();
    const url = `${config.LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/?${queryParams.toString()}`;
    return getAuthenticatedHttpClient().get(url);
  }

  fetchUserEntitlements() {
    const url = `${this.config.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;
    return this.authenticatedHttpClient.get(url);
  }

  fetchEnterpriseCustomerContainsContent() {
    // This API call will *only* obtain the enterprise's catalogs whose
    // catalog queries return/contain the specified courseKey.
    const queryParams = new URLSearchParams({
      course_run_ids: this.courseKey,
      get_catalogs_containing_specified_content_ids: true,
    });
    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${queryParams.toString()}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserLicenseSubsidy() {
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: this.enterpriseUuid,
      course_key: this.activeCourseRun.key,
    });
    const url = `${this.config.LICENSE_MANAGER_URL}/api/v1/license-subsidy/?${queryParams.toString()}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }
}
