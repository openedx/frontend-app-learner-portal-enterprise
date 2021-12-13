import React, { useContext } from 'react';
import { Badge } from '@edx/paragon';
import { SkillsContext } from './SkillsContextProvider';

const SelectedJobSkills = () => {
  const { state } = useContext(SkillsContext);
  const {
    interestedJobs, selectedJob,
  } = state;

  const selectedJobDetails = interestedJobs.filter(job => job.name === selectedJob);
  let selectedJobSkills = selectedJobDetails[0]?.skills?.sort((a, b) => (
    (a.significance < b.significance) ? 1 : -1));
  selectedJobSkills = selectedJobSkills?.slice(0, 5);

  return (
    <div style={{ paddingLeft: '10%' }} className="mb-3 mt-5">
      <h4>Top Skills for {selectedJob}</h4>
      <div className="col-12 row">
        {selectedJobSkills?.map(skill => (
          <Badge
            key={skill.name}
            className="skill-badge"
            variant="light"
            data-testid="top-skills-badge"
          >
            { skill.name }
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectedJobSkills;
