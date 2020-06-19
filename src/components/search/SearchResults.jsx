import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStats, Hits } from 'react-instantsearch-dom';

import SearchCourseCard from './SearchCourseCard';
import { StateResultsContext } from './StateResults';

const SearchResults = ({ nbHits }) => {
  const { searchState } = useContext(StateResultsContext);

  const resultsHeading = useMemo(
    () => {
      const { query } = searchState;
      const resultsLabel = nbHits === 0 || nbHits > 1 ? 'results' : 'result';
      if (query) {
        return <>&quot;{query}&quot; Courses ({nbHits} {resultsLabel})</>;
      }
      return <>Courses ({nbHits} {resultsLabel})</>;
    },
    [searchState, nbHits],
  );

  return (
    <div className="container my-5">
      <h2>{resultsHeading}</h2>
      <Hits hitComponent={SearchCourseCard} />
    </div>
  );
};

SearchResults.propTypes = {
  nbHits: PropTypes.number.isRequired,
};

export default connectStats(SearchResults);
