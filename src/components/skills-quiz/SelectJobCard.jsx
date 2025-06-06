import { useContext } from 'react';
import { SelectableBox } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import { formatStringAsNumber } from '../../utils/common';
import { checkValidGoalAndJobSelected } from '../utils/skills-quiz';
import { NOT_AVAILABLE } from './constants';
import { useEnterpriseCustomer } from '../app/data';

const SelectJobCard = () => {
  const { dispatch, state } = useContext(SkillsContext);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
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
      <h3 id="skills-quiz-jobs-skills-selections">
        <FormattedMessage
          id="enterprise.skills.quiz.v1.select.job.card.job.and.skills.heading"
          defaultMessage="Your jobs and skills"
          description="Heading for jobs and skills on the job selection card within the skills quiz v1 page."
        />
      </h3>
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
              {!enterpriseCustomer.hideLaborMarketData && (
                <div className="text-gray-700">
                  <p className="m-0 medium-font">
                    <span style={{ fontWeight: 700 }}>
                      <FormattedMessage
                        id="enterprise.skills.quiz.v1.select.job.card.median.salary"
                        defaultMessage="Median U.S. Salary: "
                        description="Label for median US salary on the job selection card within the skills quiz v1 page."
                      />
                    </span>
                    {job.jobPostings?.length > 0 && job.jobPostings[0].medianSalary
                      ? `$${ formatStringAsNumber(job.jobPostings[0].medianSalary)}` : NOT_AVAILABLE }
                  </p>
                  <p className="m-0 medium-font">
                    <span style={{ fontWeight: 700 }}>
                      <FormattedMessage
                        id="enterprise.skills.quiz.v1.select.job.card.job.postings.label"
                        defaultMessage="Job Postings: "
                        description="Label for job postings on the job selection card within the skills quiz v1 page."
                      />
                    </span>
                    {job.jobPostings?.length > 0 && job.jobPostings[0].uniquePostings
                      ? formatStringAsNumber(job.jobPostings[0].uniquePostings)
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
