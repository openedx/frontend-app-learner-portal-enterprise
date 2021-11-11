import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Card } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';
import { formatStringAsNumber } from '../../utils/common';

const JobCardComponent = ({ jobs, isLoading }) => {
  const { enterpriseConfig: { hideLaborMarketData } } = useContext(AppContext);
  return (
    <>
      {jobs?.map(job => (
        <div
          key={job.name}
          className="search-job-card mb-3 col-4"
          role="group"
          aria-label={job.name}
        >
          <Card>
            <Card.Body>
              <Card.Title as="h4" className="card-title mb-3">
                {isLoading ? (
                  <Skeleton count={1} data-testid="job-title-loading" />
                ) : (
                  <Truncate lines={1} trimWhitespace>
                    {job.name}
                  </Truncate>
                )}
              </Card.Title>
              {isLoading ? (
                <Skeleton duration={0} data-testid="job-content-loading" />
              ) : (
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
              )}
            </Card.Body>
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
