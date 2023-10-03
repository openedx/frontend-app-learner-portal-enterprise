import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { EVENT_NAMES } from './constants';
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
    this.activeCourseRun = this.activeCourseRun || getActiveCourseRun(courseDetails);

    if (!this.activeCourseRun) {
      sendEnterpriseTrackEvent(
        this.enterpriseUuid,
        EVENT_NAMES.missingActiveCourseRun,
        { course_key: this.courseKey },
      );
    }

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

  async fetchAllCourseRecommendations(activeCatalogs = []) {
    const resp = await this.fetchCourseRecommendations()
      .then(async (response) => {
        const {
          all_recommendations: allRecommendations,
          same_partner_recommendations: samePartnerRecommendations,
        } = response.data;

        // handle no recommendations case
        if (allRecommendations.length < 1 && samePartnerRecommendations.length < 1) {
          return response.data;
        }
        const allRecommendationsKeys = allRecommendations?.map((rec) => rec.key);
        const samePartnerRecommendationsKeys = samePartnerRecommendations?.map((rec) => rec.key);

        const options = {
          content_keys: allRecommendationsKeys.concat(samePartnerRecommendationsKeys),
          catalog_uuids: activeCatalogs,
        };

        const filteredRecommendations = await this.fetchFilteredRecommendations(options);
        const { filtered_content_keys: filteredContentKeys } = filteredRecommendations.data;

        const recommendations = {
          all_recommendations: allRecommendations.filter(
            (rec) => !samePartnerRecommendationsKeys.includes(rec.key) && filteredContentKeys.includes(rec.key),
          ),
          same_partner_recommendations: samePartnerRecommendations.filter(
            (rec) => filteredContentKeys.includes(rec.key),
          ),
        };
        return recommendations;
      });
    return resp;
  }

  fetchFilteredRecommendations(options) {
    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/filter_content_items/`;
    return this.cachedAuthenticatedHttpClient.post(url, options);
  }

  fetchCourseDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/courses/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchCourseRun(courseRunId = this.activeCourseRun) {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/course_runs/${courseRunId}`;
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

  fetchEnterpriseCustomerContainsContent(courseRunIds = [this.courseKey]) {
    // This API call will *only* obtain the enterprise's catalogs whose
    // catalog queries return/contain the specified courseKey.
    const queryParams = new URLSearchParams({
      course_run_ids: courseRunIds,
      get_catalogs_containing_specified_content_ids: true,
    });

    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${queryParams.toString()}`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchUserLicenseSubsidy(courseKey = this.activeCourseRun?.key) {
    if (!courseKey) {
      return undefined;
    }

    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: this.enterpriseUuid,
      course_key: courseKey,
    });

    const url = `${this.config.LICENSE_MANAGER_URL}/api/v1/license-subsidy/?${queryParams.toString()}`;
    return this.authenticatedHttpClient.get(url).catch(error => {
      const httpErrorStatus = error.customAttributes?.httpErrorStatus;
      if (httpErrorStatus === 404) {
        // 404 means the user's license is not applicable for the course, return undefined instead of throwing an error
        return {
          data: undefined,
        };
      }
      throw error;
    });
  }

  fetchCourseReviews() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/course_review/${this.courseKey}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  /**
   * Service method to determine whether the authenticated user can redeem the specified course run(s).
   *
   * @param {object} args
   * @param {array} courseRunKeys List of course run keys.
   * @returns Promise for get request from the authenticated http client.
   */
  fetchCanRedeem({ courseRunKeys }) {
    const queryParams = new URLSearchParams();
    courseRunKeys.forEach((courseRunKey) => {
      queryParams.append('content_key', courseRunKey);
    });
    const url = `${this.config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${this.enterpriseUuid}/can-redeem/`;
    const urlWithParams = `${url}?${queryParams.toString()}`;
    return this.authenticatedHttpClient.get(urlWithParams);
  }
}
