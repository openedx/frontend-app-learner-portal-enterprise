// get common skills between a course/program and the job selected by the learner
// here content can either be a course or a program
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

export default function getCommonSkills(content, selectedJobSkills, MAX_VISIBLE_SKILLS) {
  const contentSkills = content.skillNames || [];
  return contentSkills.filter(skill => selectedJobSkills.includes(skill)).slice(0, MAX_VISIBLE_SKILLS);
}

export function sortSkillsWithSignificance(job) {
  return job?.skills?.sort((a, b) => (
    (a.significance < b.significance) ? 1 : -1));
}

// sorts skills in descending order based on # of courses linked with every skill
export function sortSkillsCoursesWithCourseCount(coursesWithSkill) {
  return coursesWithSkill.sort((a, b) => (
    (a.value.length < b.value.length) ? 1 : -1));
}

export function linkToCourse(course, slug, enterpriseUUID) {
  if (!Object.keys(course).length) {
    return '#';
  }
  const queryParams = new URLSearchParams();
  if (course.queryId && course.objectId) {
    queryParams.set('queryId', course.queryId);
    queryParams.set('objectId', course.objectId);
  }
  const { userId } = getAuthenticatedUser();
  sendEnterpriseTrackEvent(
    enterpriseUUID,
    'edx.ui.enterprise.learner_portal.skills_quiz.course.clicked',
    { userId, enterprise: slug, selectedCourse: course.key },
  );
  return `/${slug}/course/${course.key}?${queryParams.toString()}`;
}
