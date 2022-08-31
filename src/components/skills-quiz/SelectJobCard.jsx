import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Card, Form } from '@edx/paragon';
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
      <h3>Your jobs and skills</h3>
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
              className="ml-2 mt-2"
            >
              <Card className={`${selectedJob === job.name ? 'border border-dark' : null} h-100`}>
                <Card.Body className="row">
                  <div className="col-10">
                    <Card.Header
                      as="h4"
                      className="card-title mb-2"
                      title={(
                        <span>
                          {job.name}
                        </span>
                      )}
                    />

                  </div>
                  <div className="col-2"><Form.Radio value={job.name} /></div>
                  <div className="col-12">
                    {!hideLaborMarketData
                      && (
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
                </Card.Body>
              </Card>
            </div>
          ))}
        </Form.RadioSet>
      </Form.Group>
    </div>
  );
};

export default SelectJobCard;
