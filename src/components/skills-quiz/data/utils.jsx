// get common skills between a course/program and the job selected by the learner
// here content can either be a course or a program

import { postSkillsGoalsAndJobsUserSelected } from './service';
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

export const saveSkillsGoalsAndJobsUserSelected = async (goal, currentJobRole, interestedJobs) => {
  const interestedJobsId = interestedJobs?.map(({ id }) => id);
  const currentJobRoleId = currentJobRole?.map(({ id }) => id);
  const goalLabel = goalLabels(goal);
  postSkillsGoalsAndJobsUserSelected(goalLabel, interestedJobsId, currentJobRoleId);
};
