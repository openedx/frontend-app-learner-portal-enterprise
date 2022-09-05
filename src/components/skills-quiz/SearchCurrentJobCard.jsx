import React, {
  useContext, useState, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';

import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { SkillsContext } from './SkillsContextProvider';
import JobCardComponent from './JobCardComponent';
import { SET_KEY_VALUE } from './data/constants';

function SearchCurrentJobCard({ index }) {
  const { refinements } = useContext(SearchContext);
  const { current_job: currentJob } = refinements;
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch, state } = useContext(SkillsContext);
  const { currentJobRole } = state;
  const jobsToFetch = useMemo(
    () => {
      const jobsArray = [];
      if (currentJob?.length > 0) {
        jobsArray.push(`name:${currentJob[0]}`);
      }
      return jobsArray;
    },
    [currentJob],
  );

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
        dispatch({ type: SET_KEY_VALUE, key: 'currentJobRole', value: hits });
        setIsLoading(false);
      }
    },
    [currentJob, dispatch, index, jobsToFetch],
  );

  return (
    <div className="row">
      <JobCardComponent jobs={currentJobRole} isLoading={isLoading} />
    </div>
  );
}

SearchCurrentJobCard.propTypes = {
  index: PropTypes.shape({
    appId: PropTypes.string,
    indexName: PropTypes.string,
    search: PropTypes.func.isRequired,
  }).isRequired,
};

export default SearchCurrentJobCard;
