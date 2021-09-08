import { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from '../SkillsContextProvider';
import { DROPDOWN_OPTION_CHANGE_ROLE } from '../constants';

export const useSelectedSkillsAndJobSkills = () => {
  const { state } = useContext(SkillsContext);
  const { selectedJob, interestedJobs, goal } = state;
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const skillsFromSelectedJob = useMemo(
    () => {
      let skillsFromJob = [];
      // if goal is to get better at current job, we should ignore the selectedJob value in SkillsContext
      // we should only show courses based on skills that learner selected
      if (selectedJob && goal !== DROPDOWN_OPTION_CHANGE_ROLE) {
        interestedJobs.forEach((job) => {
          if (job.name === selectedJob) {
            skillsFromJob = job.skills?.map(skill => skill.name);
          }
        });
      }
      return skillsFromJob;
    },
    [skills, interestedJobs, selectedJob, goal],
  );
  return skills ? skills.concat(skillsFromSelectedJob) : skillsFromSelectedJob;
};
