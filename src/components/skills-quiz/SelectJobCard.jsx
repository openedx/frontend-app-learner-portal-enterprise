import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
// TODO: Uncomment this line when jobs are coming as hits from Algolia
// import { camelCaseObject } from '@edx/frontend-platform/utils';
import { Card, Form } from '@edx/paragon';
import { SearchContext, setRefinementAction } from '@edx/frontend-enterprise-catalog-search';

const SelectJobCard = ({ hit, isLoading }) => { // eslint-disable-line no-unused-vars
  const { refinements, dispatch } = useContext(SearchContext);
  const { selectedJob, skill_names: skills } = refinements;

  const jobs = skills?.length > 0 ? skills.slice(0, 3) : null;
  // This statement will be usable once we have jobs data available in Algolia
  // Currently we are showing skills data in place of that, 'hit' will be passed as props to SearchJobCard
  // const job = hit ? camelCaseObject(hit) : {};
  const jobsCharactersCutOffLimit = 14;

  return (
    <>
      <Form.Group>
        <Form.RadioSet
          name="selected-job"
          onChange={(e) => dispatch(setRefinementAction('selectedJob', e.target.value))}
          defaultValue={selectedJob}
          isInline
          className="row"
        >

          {jobs?.map(job => (
            <div
              key={job}
              className="mb-3 col-md-3 offset-md-1"
              role="group"
              aria-label={job}
            >
              <Card className={`${selectedJob === job ? 'border border-dark' : null}`}>
                <Card.Body>
                  <Card.Title as="h5" className="card-title mb-1">
                    {isLoading ? (
                      <Skeleton count={1} data-testid="job-title-loading" />
                    ) : (
                      <>
                        {job.length > jobsCharactersCutOffLimit
                          ? `${job.substring(0, jobsCharactersCutOffLimit)}...` : job}
                      </>
                    )}
                    <Form.Radio value={job} />
                  </Card.Title>

                  {isLoading ? (
                    <Skeleton duration={0} data-testid="job-content-loading" />
                  ) : (
                    <>
                      <div>
                        <span>Median Salary:</span>
                        <span className="text-muted">
                          $110K
                        </span>
                      </div>
                      <div>
                        <span>Job Postings:</span>
                        <span className="text-muted">
                          6.5k
                        </span>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))}
        </Form.RadioSet>
      </Form.Group>
    </>
  );
};

const SkeletonSelectJobCard = (props) => (
  <SelectJobCard {...props} isLoading />
);

SelectJobCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
    medianSalary: PropTypes.string,
    jobPostings: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

SelectJobCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

SelectJobCard.Skeleton = SkeletonSelectJobCard;

export default SelectJobCard;
