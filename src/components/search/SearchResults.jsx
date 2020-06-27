import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStats, Hits } from 'react-instantsearch-dom';

import SearchCourseCard from './SearchCourseCard';
import SearchPagination from './SearchPagination';
import SearchNoResults from './SearchNoResults';

import { useRefinementsFromQueryParams } from './data/hooks';

import './styles/SearchResults.scss';

const SearchResults = ({ nbHits }) => {
  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  const query = useMemo(
    () => refinementsFromQueryParams.q,
    [refinementsFromQueryParams],
  );

  const page = useMemo(
    () => refinementsFromQueryParams.page,
    [refinementsFromQueryParams],
  );

  const resultsHeading = useMemo(
    () => {
      const resultsLabel = nbHits === 0 || nbHits > 1 ? 'results' : 'result';
      return (
        <>
          {nbHits} {resultsLabel}
          {query && <>{' '}for &quot;{query}&quot;</>}
        </>
      );
    },
    [query, nbHits],
  );

  return (
    <div className="search-results container-fluid my-5">
      {nbHits > 0 ? (
        <>
          <div className="d-flex align-items-center mb-2">
            <h2 className="flex-grow-1 mb-0">Courses</h2>
            <SearchPagination
              defaultRefinement={page}
              refinementsFromQueryParams={refinementsFromQueryParams}
              maxPagesDisplayed={5}
            />
          </div>
          <div className="lead mb-4">{resultsHeading}</div>
          <Hits hitComponent={SearchCourseCard} />
          <div className="d-flex justify-content-center">
            <SearchPagination
              defaultRefinement={page}
              refinementsFromQueryParams={refinementsFromQueryParams}
            />
          </div>
        </>
      ) : (
        <SearchNoResults />
      )}
    </div>
  );
};

SearchResults.propTypes = {
  nbHits: PropTypes.number.isRequired,
};

export default connectStats(SearchResults);
