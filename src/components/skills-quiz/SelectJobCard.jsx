import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Card, Form } from '@edx/paragon';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { formatStringAsNumber } from '../../utils/common';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';

const SelectJobCard = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { enterpriseConfig: { hideLaborMarketData } } = useContext(AppContext);
  const {
    interestedJobs, selectedJob, currentJobRole, goal,
  } = state;
  const jobsCharactersCutOffLimit = 20;
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
    <>
      <h3>Related jobs and skills</h3>
      <Form.Group>
        <Form.RadioSet
          name="selected-job"
          onChange={(e) => dispatch({ type: SET_KEY_VALUE, key: 'selectedJob', value: e.target.value })}
          defaultValue={jobSelected}
          isInline
          className="row"
        >

          {jobsCard?.map(job => (
            <div
              key={job.name}
              role="group"
              aria-label={job.name}
            >
              <Card className={`${selectedJob === job.name ? 'border border-dark' : null}`}>
                <Card.Body>
                  <Card.Title as="h4" className="card-title mb-2">
                    <>
                      {job.name.length > jobsCharactersCutOffLimit
                        ? `${job.name.substring(0, jobsCharactersCutOffLimit)}...` : job.name}
                    </>
                    <Form.Radio value={job.name} />
                  </Card.Title>
                  <>
                    {job.job_postings?.length > 0 && !hideLaborMarketData && (
                      <div className="text-gray-700">
                        <p className="m-0 medium-font">
                          <span style={{ fontWeight: 700 }}>Median U.S. Salary: </span>
                          ${formatStringAsNumber(job.job_postings[0].median_salary)}
                        </p>
                        <p className="m-0 medium-font">
                          <span style={{ fontWeight: 700 }}>Job Postings: </span>
                          {formatStringAsNumber(job.job_postings[0].unique_postings)}
                        </p>
                      </div>
                    )}
                  </>
                </Card.Body>
              </Card>
            </div>
          ))}
        </Form.RadioSet>
      </Form.Group>
    </>
  );
};

export default SelectJobCard;
