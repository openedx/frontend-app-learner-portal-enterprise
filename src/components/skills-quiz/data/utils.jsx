// get common skills between a course/program and the job selected by the learner
// here content can either be a course or a program
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { fetchSkillsId, postSkillsGoalsAndJobsUserSelected } from './service';
import {
  DROPDOWN_OPTION_CHANGE_CAREERS,
  DROPDOWN_OPTION_CHANGE_CAREERS_LABEL,
  DROPDOWN_OPTION_GET_PROMOTED,
  DROPDOWN_OPTION_GET_PROMOTED_LABEL,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
  DROPDOWN_OPTION_OTHER,
  DROPDOWN_OPTION_OTHER_LABEL,
} from '../constants';

export default function getCommonSkills(content, selectedJobSkills, MAX_VISIBLE_SKILLS) {
  const contentSkills = content.skillNames || [];
  return contentSkills.filter(skill => selectedJobSkills.includes(skill)).slice(0, MAX_VISIBLE_SKILLS);
}

export const goalLabels = (goal) => {
  if (goal === DROPDOWN_OPTION_CHANGE_CAREERS) {
    return DROPDOWN_OPTION_CHANGE_CAREERS_LABEL;
  }
  if (goal === DROPDOWN_OPTION_GET_PROMOTED) {
    return DROPDOWN_OPTION_GET_PROMOTED_LABEL;
  }
  if (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE) {
    return DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL;
  }
  if (goal === DROPDOWN_OPTION_OTHER) {
    return DROPDOWN_OPTION_OTHER_LABEL;
  }
  return DROPDOWN_OPTION_OTHER_LABEL;
};
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

export const saveSkillsGoalsAndJobsUserSelected = async (goal, skills, currentJobRole, interestedJobs) => {
  const { data: { results } } = await fetchSkillsId(skills);
  const skillsId = results?.map(({ id }) => id);
  const interestedJobsId = interestedJobs?.map(({ id }) => id);
  const currentJobRoleId = currentJobRole?.map(({ id }) => id);
  const goalLabel = goalLabels(goal);
  postSkillsGoalsAndJobsUserSelected(goalLabel, skillsId, interestedJobsId, currentJobRoleId);
};
