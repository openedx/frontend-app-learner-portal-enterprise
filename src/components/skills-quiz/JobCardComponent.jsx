import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Card } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import PropTypes from 'prop-types';
import { formatStringAsNumber } from '../../utils/common';
import { NOT_AVAILABLE } from './constants';

const JobCardComponent = ({ jobs, isLoading }) => {
  const { enterpriseConfig: { hideLaborMarketData } } = useContext(AppContext);
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {jobs?.map(job => (
        <div
          key={job.name}
          className="search-job-card mb-3 col-4"
          role="group"
          aria-label={job.name}
        >
          <Card className="h-100">
            <Card.Header
              title={
                isLoading ? (
                  <Skeleton count={1} data-testid="job-title-loading" />
                ) : (
                  <span>
                    {job.name}
                  </span>
                )
              }
            />

            <Card.Section className="py-3">
              {isLoading ? (
                <Skeleton duration={0} data-testid="job-content-loading" />
              ) : (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {!hideLaborMarketData
                   && (
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
                </>
              )}
            </Card.Section>
          </Card>
        </div>
      ))}
    </>
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
