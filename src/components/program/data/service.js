import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getConfig } from '@edx/frontend-platform/config';
import { getAvailableCourseRuns } from '../../course/data/utils';

export default class ProgramService {
  constructor(options = {}) {
    const { enterpriseUuid, programUuid } = options;
    this.config = getConfig();

    this.cachedAuthenticatedHttpClient = getAuthenticatedHttpClient({
      useCache: this.config.USE_API_CACHE,
    });

    this.enterpriseUuid = enterpriseUuid;
    this.programUuid = programUuid;
  }

  async fetchAllProgramData() {
    const programDataRaw = await Promise.all([
      this.fetchProgramDetails(),
      this.fetchEnterpriseCatalogData(),
    ])
      .then((responses) => responses.map(res => res.data));

    const programData = camelCaseObject(programDataRaw);
    const programDetails = programData[0];
    const catalogData = programData[1];
    const programsUuids = catalogData.programs?.map((program) => program.uuid);

    programDetails.courses.forEach((course, index) => {
      const availableCourseRuns = getAvailableCourseRuns(course);
      programDetails.courses[index].activeCourseRun = availableCourseRuns ? availableCourseRuns[0] : undefined;
      programDetails.courses[index].enterpriseHasCourse = true;
    });

    programDetails.catalogContainsProgram = programsUuids.includes(programDetails.uuid);

    return {
      programDetails,
    };
  }

  fetchEnterpriseCatalogData() {
    const url = `${this.config.LMS_BASE_URL}/api/catalogs/${this.enterpriseUuid}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  fetchProgramDetails() {
    const url = `${this.config.DISCOVERY_API_BASE_URL}/api/v1/programs/${this.programUuid}/`;
    return this.cachedAuthenticatedHttpClient.get(url);
  }

  async fetchProgramContainsCourses(courseKeys) {
    let response = {};

    // if the program uuid belongs to enterprise then all the courses belong to program
    const programBelongsToCustomer = await this.fetchEnterpriseContainsContentItems(this.programUuid);

    // construct the response for all the courses of this program
    if (programBelongsToCustomer[this.programUuid]) {
      courseKeys.forEach((courseKey) => {
        response[courseKey] = true;
      });

    // if program uuid is not present in any catalog belong to enterprise
    // then check individual courses to see if the course belong to enterprise
    } else {
      response = await Promise.all(
        courseKeys.map(courseKey => this.fetchEnterpriseContainsContentItems(undefined, courseKey)),
      );
      response = Object.assign({}, ...response);
    }

    return response;
  }

  async fetchEnterpriseContainsContentItems(programUuid = undefined, courseKey = undefined) {
    const responseKey = courseKey || programUuid;
    const options = courseKey ? { course_run_ids: courseKey } : { program_uuids: this.programUuid };
    const queryParams = new URLSearchParams(options);
    const url = `${this.config.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${this.enterpriseUuid}/contains_content_items/?${queryParams.toString()}`;
    const response = await this.cachedAuthenticatedHttpClient.get(url);
    return { [responseKey]: response.data.contains_content_items };
  }
}
