import React, { useContext } from 'react';
import { Badge } from '@edx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from './constants';

const SelectedJobSkills = () => {
  const { state } = useContext(SkillsContext);
  const {
    interestedJobs, selectedJob, goal, currentJobRole,
  } = state;

  // Select currentJobRole from state if goal is to improve current job role otherwise choose interestedJobs
  const jobSelected = goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE ? currentJobRole : interestedJobs;
  const selectedJobDetails = jobSelected?.filter(job => job.name === selectedJob) || [];
  let selectedJobSkills = selectedJobDetails[0]?.skills?.sort((a, b) => (
    (a.significance < b.significance) ? 1 : -1));
  selectedJobSkills = selectedJobSkills?.slice(0, 5);

  return (
    <div className="my-4">
      <div className="col-12 row">
        {selectedJobSkills?.map(skill => (
          <Badge
            key={skill.name}
            className="skill-badge"
            variant="light"
            data-testid="top-skills-badge"
          >
            {skill.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedJobSkills;
