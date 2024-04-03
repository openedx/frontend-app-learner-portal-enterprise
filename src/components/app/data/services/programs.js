import { getConfig } from '@edx/frontend-platform/config';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { fetchEnterpriseCustomerContainsContent } from './content';
import { getAvailableCourseRuns } from '../utils';

export async function fetchLearnerProgramProgressDetail(programUUID) {
  const config = getConfig();
  const url = `${config.LMS_BASE_URL}/api/dashboard/v0/programs/${programUUID}/progress_details/`;

  try {
    const response = await getAuthenticatedHttpClient().get(url);
    return camelCaseObject(response.data);
  } catch (error) {
    logError(error);
    return {
      certificateData: [],
      courseData: null,
      creditPathways: [],
      industryPathways: [],
      programData: null,
      urls: null,
    };
  }
}
const retrieveCustomerContainsContent = async (enterpriseUuid, programUuid, courseKeys) => {
  // Verify program belongs to customer
  const programContent = await fetchEnterpriseCustomerContainsContent(enterpriseUuid, [programUuid]);
  // Build contains course object { courseKey: Boolean, ...}
  let courseContent;
  if (!programContent.containsContentItems) {
    courseContent = await Promise.all(
      courseKeys.map(async (courseKey) => {
        const { containsContentItems } = await fetchEnterpriseCustomerContainsContent(enterpriseUuid, [courseKey]);
        return [courseKey, containsContentItems];
      }),
    );
    courseContent = Object.fromEntries(courseContent);
    return courseContent;
  }
  courseContent = Object.fromEntries(courseKeys.map(courseKey => [courseKey, true]));
  return courseContent;
};

export async function fetchProgramDetails(enterpriseUuid, programUuid) {
  const { DISCOVERY_API_BASE_URL, USE_API_CACHE } = getConfig();
  const url = `${DISCOVERY_API_BASE_URL}/api/v1/programs/${programUuid}/`;
  try {
    const programResponse = await getAuthenticatedHttpClient({ useCache: USE_API_CACHE }).get(url);
    const programDetails = camelCaseObject(programResponse.data);
    if (!programDetails) {
      return null;
    }
    const programDetailsCopy = structuredClone(programDetails);
    const { courses } = programDetailsCopy;
    // Retrieve course keys
    const courseKeys = courses.map(({ key }) => key);
    // Verify program or courses belongs to customer
    const courseContent = await retrieveCustomerContainsContent(enterpriseUuid, programUuid, courseKeys);
    // // Verify program belongs to customer
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
    return null;
  }
}
