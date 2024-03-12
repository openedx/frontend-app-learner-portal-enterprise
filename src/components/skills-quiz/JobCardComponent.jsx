import { Card, CardGrid } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { formatStringAsNumber } from '../../utils/common';
import { NOT_AVAILABLE } from './constants';
import { useEnterpriseCustomer } from '../app/data';

const JobCardComponent = ({ jobs, isLoading }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  if (!jobs) {
    return null;
  }

  return (
    <CardGrid>
      {jobs?.map(job => (
        <Card key={job.name} isLoading={isLoading}>
          <Card.Header title={job.name} />
          <Card.Section>
            {!enterpriseCustomer.hideLaborMarketData && (
              <div className="text-gray-700">
                <p className="m-0 medium-font">
                  <span style={{ fontWeight: 700 }}>
                    <FormattedMessage
                      id="enterprise.skills.quiz.v1.job.card.median.salary"
                      defaultMessage="Median U.S. Salary: "
                      description="Label for median US salary on the job card within the skills quiz v1 page."
                    />
                  </span>
                  {job.job_postings?.length > 0 ? `$${ formatStringAsNumber(job.job_postings[0].median_salary)}`
                    : NOT_AVAILABLE }
                </p>
                <p className="m-0 medium-font">
                  <span style={{ fontWeight: 700 }}>
                    <FormattedMessage
                      id="enterprise.skills.quiz.v1.job.card.job.postings.label"
                      defaultMessage="Job Postings: "
                      description="Label for job postings on the job card within the skills quiz v1 page."
                    />
                  </span>
                  {job.job_postings?.length > 0 ? formatStringAsNumber(job.job_postings[0].unique_postings)
                    : NOT_AVAILABLE }
                </p>
              </div>
            )}
          </Card.Section>
        </Card>
      ))}
    </CardGrid>
  );
};

JobCardComponent.defaultProps = {
  jobs: undefined,
  isLoading: false,
};

JobCardComponent.propTypes = {
  isLoading: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.shape()),
};

export default JobCardComponent;
