import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connectStateResults, Hits } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';
import { useNbHitsFromSearchResults, SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { Container } from '@edx/paragon';

import SearchJobCard from './SearchJobCard';
import { isDefinedAndNotNull } from '../../utils/common';

const SearchResults = ({
  searchResults,
  isSearchStalled,
  error,
}) => {
  const { refinementsFromQueryParams } = useContext(SearchContext);
  const nbHits = useNbHitsFromSearchResults(searchResults);

  return (
    <Container size="lg" className="search-results my-5">
      <>
        {isSearchStalled && (
          <>
            <Skeleton className="lead mb-4" width={160} />
            <div className="skeleton-course-card">
              <SearchJobCard.Skeleton />
            </div>
          </>
        )}
        {!isSearchStalled && nbHits > 0 && (
          <>
             <Hits hitComponent={SearchJobCard} />
          </>
        )}
        {!isSearchStalled && nbHits === 0 && (
          <p>No jobs found </p>
        )}
        {!isSearchStalled && isDefinedAndNotNull(error) && (
          <p> An error occured while fetching jobs </p>
        )}
      </>
    </Container>
  );
};

SearchResults.propTypes = {
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