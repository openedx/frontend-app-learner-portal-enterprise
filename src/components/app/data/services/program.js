import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { getAvailableCourseRuns } from '../../../course/data/utils';

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
    if (programDetails) {
      const programDetailsCopy = structuredClone(programDetails);
      const { courses } = programDetailsCopy;
      // Retrieve course keys
      const courseKeys = courses.map(({ key }) => key);

      // Verify program belongs to customer
      const programContent = await fetchEnterpriseContainsContentItemProgram(enterpriseUuid, programUuid);

      // Build contains course object { courseKey: Boolean, ...}
      let courseContent;
      if (!programContent.containsContentItems) {
        courseContent = await fetchEnterpriseContainsContentItemsCourseRuns(enterpriseUuid, courseKeys);
        courseContent = Object.fromEntries(courseContent);
      } else {
        courseContent = Object.fromEntries(courseKeys.map(courseKey => [courseKey, true]));
      }
      let catalogContainsCourse = false;
      // Assign computed metadata to the program details object
      courses.forEach((course, index) => {
        console.log(courses, 'here');
        const availableCourseRuns = getAvailableCourseRuns({ course });
        programDetailsCopy.courses[index].enterpriseHasCourse = courseContent[programDetailsCopy.courses[index].key];
        if (courseContent[programDetailsCopy.courses[index].key] === true) {
          catalogContainsCourse = true;
        }
      });
      return {
        ...programDetailsCopy,
        catalogContainsCourse,
      };
    }
  } catch (error) {
    logError(error);
    return {};
  }
}
