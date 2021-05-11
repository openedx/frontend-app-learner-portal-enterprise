import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import {
  useNbHitsFromSearchResults, SearchContext, SearchPagination,
} from '@edx/frontend-enterprise-catalog-search';
import { Container, Row } from '@edx/paragon';

import SearchCourseCard from './SearchCourseCard';
import SearchNoResults from './SearchNoResults';
import SearchError from './SearchError';

import { isDefinedAndNotNull } from '../../utils/common';
import { NUM_RESULTS_PER_PAGE } from './constants';

const SearchResults = ({
  searchResults,
  searchState,
  isSearchStalled,
  error,
}) => {
  const { refinementsFromQueryParams } = useContext(SearchContext);
  const nbHits = useNbHitsFromSearchResults(searchResults);

  const query = useMemo(
    () => {
      if (refinementsFromQueryParams.q) {
        return refinementsFromQueryParams.q;
      }
      return searchState && searchState.query;
    },
    [searchState, refinementsFromQueryParams],
  );

  const page = useMemo(
    () => {
      if (refinementsFromQueryParams.page) {
        return refinementsFromQueryParams.page;
      }
      return searchState && searchState.page;
    },
    [searchState, refinementsFromQueryParams],
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
    [nbHits, query],
  );

  return (
    <Container size="lg" className="search-results my-5">
      <>
        <div className="d-flex align-items-center mb-2">
          <h2 className="flex-grow-1 mb-0">
            {isSearchStalled && (
              <Skeleton className="h2 d-block mb-3" width={240} />
            )}
            {!isSearchStalled && nbHits > 0 && (
              <>Courses</>
            )}
          </h2>
          {!isSearchStalled && nbHits > 0 && (
            <SearchPagination
              defaultRefinement={page}
              maxPagesDisplayed={5}
            />
          )}
        </div>
        {isSearchStalled && (
          <>
            <Skeleton className="lead mb-4" width={160} />
            <Row>
              {[...Array(NUM_RESULTS_PER_PAGE).keys()].map(resultNum => (
                <div key={resultNum} className="skeleton-course-card">
                  <SearchCourseCard.Skeleton />
                </div>
              ))}
            </Row>
          </>
        )}
        {!isSearchStalled && nbHits > 0 && (
          <>
            <div className="lead mb-4">{resultsHeading}</div>
            <Hits hitComponent={SearchCourseCard} />
            <div className="d-flex justify-content-center">
              <SearchPagination defaultRefinement={page} />
            </div>
          </>
        )}
        {!isSearchStalled && nbHits === 0 && (
          <SearchNoResults />
        )}
        {!isSearchStalled && isDefinedAndNotNull(error) && (
          <SearchError />
        )}
      </>
    </Container>
  );
};

SearchResults.propTypes = {
  searchState: PropTypes.shape({
    query: PropTypes.string,
    page: PropTypes.number,
  }).isRequired,
  searchResults: PropTypes.shape({
    nbHits: PropTypes.number,
  }),
  isSearchStalled: PropTypes.bool,
  error: PropTypes.shape(),
};

SearchResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
};

export default connectStateResults(SearchResults);
