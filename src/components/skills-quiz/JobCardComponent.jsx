import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Card, CardGrid } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { formatStringAsNumber } from '../../utils/common';
import { NOT_AVAILABLE } from './constants';

const JobCardComponent = ({ jobs, isLoading }) => {
  const { enterpriseConfig: { hideLaborMarketData } } = useContext(AppContext);
  if (!jobs) {
    return null;
  }

  return (
    <CardGrid>
      {jobs?.map(job => (
        <Card key={job.name} isLoading={isLoading}>
          <Card.Header title={job.name} />
          <Card.Section>
            {!hideLaborMarketData && (
              <div className="text-gray-700">
                <p className="m-0 medium-font">
                  <span style={{ fontWeight: 700 }}>Median U.S. Salary: </span>
                  {job.job_postings?.length > 0 ? `$${ formatStringAsNumber(job.job_postings[0].median_salary)}`
                    : NOT_AVAILABLE }
                </p>
                <p className="m-0 medium-font">
                  <span style={{ fontWeight: 700 }}>Job Postings: </span>
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
