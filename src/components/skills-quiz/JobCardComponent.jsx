import React from 'react';
import { Card } from '@edx/paragon';
import Skeleton from 'react-loading-skeleton';
import Truncate from 'react-truncate';
import PropTypes from 'prop-types';

const JobCardComponent = ({ jobs, isLoading }) => (
  <>
    {jobs?.map(job => (
      <div
        key={job.name}
        className="search-job-card mb-3"
        role="group"
        aria-label={job.name}
      >
        <Card>
          <Card.Body>
            <Card.Title as="h5" className="card-title mb-3">
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
                {job.job_postings && job.job_postings.length > 0 && (
                  <div>
                    <p className="text-muted m-0 medium-font">
                      <span style={{ fontWeight: 500 }}>Median Salary:</span> {job.job_postings[0].median_salary}
                    </p>
                    <p className="text-muted m-0 medium-font">
                      <span style={{ fontWeight: 500 }}>Job Postings:</span> {job.job_postings[0].unique_postings}
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

JobCardComponent.defaultProps = {
  jobs: undefined,
  isLoading: false,
};

JobCardComponent.propTypes = {
  isLoading: PropTypes.bool,
  jobs: PropTypes.arrayOf(PropTypes.shape()),
};

export default JobCardComponent;
