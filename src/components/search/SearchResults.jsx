import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, Hits } from 'react-instantsearch-dom';

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
      {nbHits > 0 ? (
        <>
          <div className="d-flex align-items-center mb-2">
            <h2 className="flex-grow-1 mb-0">Courses</h2>
            <SearchPagination
              defaultRefinement={page}
              maxPagesDisplayed={5}
            />
          </div>
          <div className="lead mb-4">{resultsHeading}</div>
          <Hits hitComponent={SearchCourseCard} />
          <div className="d-flex justify-content-center">
            <SearchPagination defaultRefinement={page} />
          </div>
        </>
      ) : (
        <SearchNoResults />
      )}
    </div>
  );
};

SearchResults.propTypes = {
  searchResults: PropTypes.shape({
    nbHits: PropTypes.number,
  }).isRequired,
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
  error: undefined,
};

export default connectStateResults(SearchResults);
