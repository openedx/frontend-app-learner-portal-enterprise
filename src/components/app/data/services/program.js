import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { getAvailableCourseRuns } from '../../../course/data/utils';
import { fetchEnterpriseCustomerContainsContent } from './content';

export async function fetchEnterpriseContainsContentItemProgram(enterpriseUuid, programUuid) {
  const { ENTERPRISE_CATALOG_API_BASE_URL, USE_API_CACHE } = getConfig();
  const programQuery = new URLSearchParams(
    { program_uuids: programUuid },
  );
  const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseUuid}/contains_content_items/?${programQuery.toString()}}}`;
  try {
    const response = await getAuthenticatedHttpClient({ useCache: USE_API_CACHE }).get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return {};
  }
}

export async function fetchEnterpriseContainsContentItemsCourseRuns(enterpriseUuid, courseKeys) {
  const { ENTERPRISE_CATALOG_API_BASE_URL, USE_API_CACHE } = getConfig();
  const responses = Promise.all(
    courseKeys.map(async (courseKey) => {
      const courseRunQuery = new URLSearchParams(
        { course_run_ids: courseKey },
      );
      const url = `${ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${enterpriseUuid}/contains_content_items/?${courseRunQuery.toString()}`;
      try {
        const response = await getAuthenticatedHttpClient({ useCache: USE_API_CACHE }).get(url);
        const { containsContentItems } = camelCaseObject(response.data);
        return [courseKey, containsContentItems];
      } catch (error) {
        logError(error);
        return {};
      }
    }),
  );
  return responses;
}

export async function fetchProgramDetails(enterpriseUuid, programUuid) {
  const { DISCOVERY_API_BASE_URL, USE_API_CACHE } = getConfig();
  const url = `${DISCOVERY_API_BASE_URL}/api/v1/programs/${programUuid}/`;
  try {
    const programResponse = await getAuthenticatedHttpClient({ useCache: USE_API_CACHE }).get(url);
    const programDetails = camelCaseObject(programResponse.data);
    if (!programDetails) {
      return {};
    }
    const programDetailsCopy = structuredClone(programDetails);
    const { courses } = programDetailsCopy;
    // Retrieve course keys
    const courseKeys = courses.map(({ key }) => key);

    // Verify program belongs to customer
    const programContent = await fetchEnterpriseCustomerContainsContent(enterpriseUuid, [programUuid]);
    console.log(programContent);
    // Build contains course object { courseKey: Boolean, ...}
    let courseContent;
    if (!programContent.containsContentItems) {
      courseContent = Promise.all(
        courseKeys.map(async (courseKey) => {
          fetchEnterpriseCustomerContainsContent(enterpriseUuid, [courseKey]);
        }),
      );
      console.log(courseContent);
      courseContent = Object.fromEntries(courseContent);
    } else {
      courseContent = Object.fromEntries(courseKeys.map(courseKey => [courseKey, true]));
    }
    let catalogContainsProgram = false;
    // Assign computed metadata to the program details object
    courses.forEach((course, index) => {
      const availableCourseRuns = getAvailableCourseRuns({ course });
      // TODO: Run a more deliberate selection of the activeCourseRun based on the advertisedCourseRunUuid
      // from the catalog service vs discovery
      // programDetailsCopy.courses[index].activeCourseRun = availableCourseRuns.find(
      //   courseRun => courseRun.uuid === course.advertisedCourseRunUuid,
      // );
      programDetailsCopy.courses[index].activeCourseRun = availableCourseRuns ? availableCourseRuns[0] : undefined;
      programDetailsCopy.courses[index].enterpriseHasCourse = courseContent[programDetailsCopy.courses[index].key];
      if (courseContent[programDetailsCopy.courses[index].key] === true) {
        catalogContainsProgram = true;
      }
    });
    return {
      ...programDetailsCopy,
      catalogContainsProgram,
    };
  } catch (error) {
    logError(error);
    return {};
  }
}
