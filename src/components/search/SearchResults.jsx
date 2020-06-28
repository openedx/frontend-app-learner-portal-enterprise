import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';

import SearchCourseCard from './SearchCourseCard';
import SearchPagination from './SearchPagination';
import SearchNoResults from './SearchNoResults';

import './styles/SearchResults.scss';

const SearchResults = ({
  searchResults, searchState, error, isSearchStalled,
}) => {
  const nbHits = searchResults && searchResults.nbHits;
  const query = searchState && searchState.query;
  const page = searchState && searchState.page;

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
      <>
        <div className="d-flex align-items-center mb-2">
          <h2 className="flex-grow-1 mb-0">Courses</h2>
          {nbHits > 0 && (
            <SearchPagination
              defaultRefinement={page}
              maxPagesDisplayed={5}
            />
          )}
        </div>
        <div className="lead mb-4">
          {isSearchStalled ? (
            <Skeleton />
          ) : (
            <>{resultsHeading}</>
          )}
        </div>
        <Hits hitComponent={SearchCourseCard} />
        {nbHits > 0 && (
          <div className="d-flex justify-content-center">
            <SearchPagination defaultRefinement={page} />
          </div>
        )}
      </>
      {nbHits === 0 && (
        <SearchNoResults />
      )}
    </div>
  );
};

SearchResults.propTypes = {
  searchResults: PropTypes.shape({
    nbHits: PropTypes.number,
  }),
  searchState: PropTypes.shape({
    query: PropTypes.string,
    page: PropTypes.number,
  }).isRequired,
  isSearchStalled: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

SearchResults.defaultProps = {
  searchResults: undefined,
  error: {
    message: 'Sup nigga',
  },
};

export default connectStateResults(SearchResults);
