import React, {
  useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import { SET_KEY_VALUE } from './data/constants';
import JobCardComponent from './JobCardComponent';

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
    [dispatch, index, jobs, jobsToFetch],
  );

  return <JobCardComponent jobs={interestedJobs} isLoading={isLoading} />;
};

SearchJobCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchJobCard;
