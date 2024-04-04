import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { getErrorResponseStatusCode } from '../../../utils/common';

export default class CourseService {
  constructor(options = {}) {
    const {
      activeCourseRun,
      courseKey,
      courseRunKey,
      enterpriseUuid,
      isEnrollableBufferDays,
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
    this.isEnrollableBufferDays = isEnrollableBufferDays;
  }

  fetchCourseRun(courseRunId = this.activeCourseRun) {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/course_runs/${courseRunId}`;
    return this.cachedAuthenticatedHttpClient.get(url);
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
      const httpErrorStatus = getErrorResponseStatusCode(error);
      if (httpErrorStatus === 404) {
        // 404 means the user's license is not applicable for the course, return undefined instead of throwing an error
        return {
          data: undefined,
        };
      }
      throw error;
    });
  }
}
