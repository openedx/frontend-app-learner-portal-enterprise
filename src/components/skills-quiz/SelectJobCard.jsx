import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { SelectableBox } from '@openedx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { formatStringAsNumber } from '../../utils/common';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';
import { NOT_AVAILABLE } from './constants';

const SelectJobCard = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { enterpriseConfig: { hideLaborMarketData } } = useContext(AppContext);
  const {
    interestedJobs, selectedJob, currentJobRole, goal,
  } = state;
  let jobSelected;
  let jobsCard;
  if (checkValidGoalAndJobSelected(goal, currentJobRole, true)) {
    jobSelected = currentJobRole[0].name;
    jobsCard = currentJobRole;
  } else {
    jobSelected = selectedJob;
    jobsCard = interestedJobs;
  }

  return (
    <div>
      <h3 id="skills-quiz-jobs-skills-selections">Your jobs and skills</h3>
      <SelectableBox.Set
        ariaLabelledby="skills-quiz-jobs-skills-selections"
        name="selected-job"
        type="radio"
        onChange={(e) => dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: e.target.value })}
        value={jobSelected}
        columns={3}
      >
        {jobsCard?.map(job => (
          <SelectableBox
            key={job.name}
            value={job.name}
            type="radio"
            aria-label={job.name}
            inputHidden={false}
          >
            <div>
              <h4>{job.name}</h4>
              {!hideLaborMarketData && (
                <div className="text-gray-700">
                  <p className="m-0 medium-font">
                    <span style={{ fontWeight: 700 }}>Median U.S. Salary: </span>
                    {job.job_postings?.length > 0 && job.job_postings[0].median_salary
                      ? `$${ formatStringAsNumber(job.job_postings[0].median_salary)}` : NOT_AVAILABLE }
                  </p>
                  <p className="m-0 medium-font">
                    <span style={{ fontWeight: 700 }}>Job Postings: </span>
                    {job.job_postings?.length > 0 && job.job_postings[0].unique_postings
                      ? formatStringAsNumber(job.job_postings[0].unique_postings)
                      : NOT_AVAILABLE }
                  </p>
                </div>
              )}
            </div>
          </SelectableBox>
        ))}
      </SelectableBox.Set>
    </div>
  );
};

export default SelectJobCard;
