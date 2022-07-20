import { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from '../SkillsContextProvider';
import { checkValidGoalAndJobSelected } from '../../utils/skills-quiz';
import { sortSkillsWithSignificance } from './utils';

export const useSelectedSkillsAndJobSkills = ({ getAllSkills, getAllSkillsWithSignificanceOrder }) => {
  const { state } = useContext(SkillsContext);
  const {
    selectedJob, interestedJobs, goal, currentJobRole,
  } = state;
  const { refinements: { skill_names: skills } } = useContext(SearchContext);

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

  const allSkillsWithoutSignificanceOrder = useMemo(() => {
    if (skills) {
      return skills.concat(skillsFromSelectedJob);
    }
    return skillsFromSelectedJob;
  }, [skills, skillsFromSelectedJob]);

  const allSkillsWithSignificantOrder = useMemo(() => {
    const allSkills = [];
    skillsFromSelectedJob.forEach((skill) => allSkills.push({
      key: skill.name,
      value: skill.significance,
    }));

    if (skills) {
      allSkills.push([...skills.map((skill) => ({ key: skill, value: undefined }))]);
    }
    return allSkills;
  }, [skills, skillsFromSelectedJob]);

  // Top 3 Recommended courses are shown based on job-skills only
  // But on search page show courses based on job-skills and skills selected in skills dropdown as well
  if (getAllSkills) {
    return allSkillsWithoutSignificanceOrder;
  }

  if (getAllSkillsWithSignificanceOrder) {
    return allSkillsWithSignificantOrder;
  }

  return skillsFromSelectedJob;
};
