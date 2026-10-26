import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

export async function postSkillsGoalsAndJobsUserSelected(goal, interestedJobsId, currentJobRoleId) {
  const options = {
    goal,
    current_job: currentJobRoleId ? currentJobRoleId[0] : null,
    future_jobs: interestedJobsId || [],
  };
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
  return getAuthenticatedHttpClient().post(url, options);
}

async function fetchEnrollmentPages(url) {
  const { data } = await getAuthenticatedHttpClient().get(url);
  if (!data.next) {
    return data.results;
  }
  return [...data.results, ...await fetchEnrollmentPages(data.next)];
}

// Returns every enrollment of the current user. The v2 list is paginated, so
// each page is read in turn until there is no next page.
//
// Unlike the v1 list, v2 also returns inactive enrollments. A course the
// learner has unenrolled from therefore counts as enrolled here and is left
// out of the Skills Quiz recommendations.
export function fetchCourseEnrollments() {
  const config = getConfig();
  return fetchEnrollmentPages(`${config.LMS_BASE_URL}/api/enrollment/v2/enrollment/?page_size=100`);
}

export async function fetchJobPathDescription(currentJobID, futureJobID) {
  const config = getConfig();
  const url = `${config.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/job-path/?current_job=${currentJobID}&future_job=${futureJobID}`;
  const result = await getAuthenticatedHttpClient().get(url);
  return result.data.description;
}
