import { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from '../SkillsContextProvider';

export const useSelectedSkillsAndJobSkills = () => {
  const { state } = useContext(SkillsContext);
  const { selectedJob, interestedJobs } = state;
  const { refinements } = useContext(SearchContext);
  const { skill_names: skills } = refinements;
  const skillsFromSelectedJob = useMemo(
    () => {
      let skillsFromJob = [];
      if (selectedJob) {
        interestedJobs.forEach((job) => {
          if (job.name === selectedJob) {
            skillsFromJob = job.skills?.map(skill => skill.name);
          }
        });
      }
      return skillsFromJob;
    },
    [interestedJobs, selectedJob],
  );
  return skills ? skills.concat(skillsFromSelectedJob) : skillsFromSelectedJob;
};
