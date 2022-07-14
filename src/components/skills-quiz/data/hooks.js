import { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from '../SkillsContextProvider';
import { checkValidGoalAndJobSelected } from '../../utils/skills-quiz';
import { sortSkillsWithSignificance } from './utils';

export const useSelectedSkillsAndJobSkills = ({ getAllSkills, getAllSkillsWithSignificanceOrder = false }) => {
  const { state } = useContext(SkillsContext);
  const {
    selectedJob, interestedJobs, goal, currentJobRole,
  } = state;
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const skillsFromSelectedJob = useMemo(
    () => {
      let skillsFromJob = [];
      if (selectedJob && checkValidGoalAndJobSelected(goal, interestedJobs, false)) {
        interestedJobs.forEach((job) => {
          if (job.name === selectedJob) {
            if (getAllSkillsWithSignificanceOrder) {
              skillsFromJob = sortSkillsWithSignificance(job);
            } else {
              skillsFromJob = job.skills?.map(skill => skill.name);
            }
          }
        });
      }
      if (checkValidGoalAndJobSelected(goal, currentJobRole, true)) {
        // there can be only one current job.
        if (getAllSkillsWithSignificanceOrder) {
          skillsFromJob = sortSkillsWithSignificance(currentJobRole[0]);
        } else {
          skillsFromJob = currentJobRole[0].skills?.map(skill => skill.name);
        }
      }
      return skillsFromJob;
    },
    [selectedJob, goal, interestedJobs, currentJobRole, getAllSkillsWithSignificanceOrder],
  );
  // Top 3 Recommended courses are shown based on job-skills only
  // But on search page show courses based on job-skills and skills selected in skills dropdown as well
  if (getAllSkills) {
    return skills ? skills.concat(skillsFromSelectedJob) : skillsFromSelectedJob;
  }
  if (getAllSkillsWithSignificanceOrder) {
    const allSkills = [];
    skillsFromSelectedJob.forEach((skill) => allSkills.push({
      key: skill.name,
      value: skill.significance,
    }));
    // eslint-disable-next-line no-unused-expressions
    skills?.forEach((skill) => allSkills.push({
      key: skill,
      value: undefined,
    }));
    return allSkills;
  }
  return skillsFromSelectedJob;
};
