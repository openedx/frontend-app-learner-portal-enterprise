import React, {
  useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';
import Skeleton from 'react-loading-skeleton';
import { Card } from '@edx/paragon';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';

const SearchJobCard = ({ index }) => {
  const { refinements } = useContext(SearchContext);
  const { name: jobs } = refinements;
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch, state } = useContext(SkillsContext);
  const { interestedJobs } = state;
  const jobsToFetch = useMemo(() => {
    const jobsArray = [];
    if (jobs) {
      jobs.forEach(job => jobsArray.push(`name:${job}`));
    }
    return jobsArray;
  },
  [jobs]);

  useEffect(
    () => {
      let fetch = true;
      fetchJobs(); // eslint-disable-line no-use-before-define
      return () => { fetch = false; };

      async function fetchJobs() {
        setIsLoading(true);
        const { hits } = await index.search('', {
          facetFilters: [
            jobsToFetch,
          ],
        });
        if (!fetch) { return; }
        const jobHits = hits.length <= 3 ? hits : hits.slice(0, 3);
        dispatch({ type: SET_KEY_VALUE, key: 'interestedJobs', value: jobHits });
        setIsLoading(false);
      }
    },
    [jobs],
  );

  return (
    <div>
      {interestedJobs?.map(job => (
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
    </div>
  );
};

SearchJobCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchJobCard;
