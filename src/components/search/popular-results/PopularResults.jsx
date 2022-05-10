import React from 'react';
import PropTypes from 'prop-types';
import { Hits, connectStateResults } from 'react-instantsearch-dom';
import Skeleton from 'react-loading-skeleton';

import { useNbHitsFromSearchResults } from '@edx/frontend-enterprise-catalog-search';
import SearchError from '../SearchError';

import { isDefinedAndNotNull } from '../../../utils/common';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';
import { getHitComponentFromTitle, getSkeletonCardFromTitle } from '../../utils/search';

const PopularResults = ({
  searchResults,
  isSearchStalled,
  error,
  title,
}) => {
  const nbHits = useNbHitsFromSearchResults(searchResults);

  return (
    <>
      <h2 className="mb-4">
        {isSearchStalled && (
          <Skeleton className="h2 d-block mb-3" width={240} />
        )}
      </h2>
      {isSearchStalled && (
        <div className="row">
          {[...Array(NUM_RESULTS_TO_DISPLAY).keys()].map(resultNum => (
            <div key={resultNum} className="skeleton-course-card">
              {getSkeletonCardFromTitle(title)}
            </div>
          ))}
        </div>
      )}
      {!isSearchStalled && nbHits > 0 && (
        <>
          <h2>
            {`Popular ${title}`}
          </h2>
          <Hits hitComponent={getHitComponentFromTitle(title)} />
        </>
      )}
      {!isSearchStalled && isDefinedAndNotNull(error) && (
        <SearchError />
      )}
    </>
  );
};

PopularResults.propTypes = {
  searchResults: PropTypes.shape(),
  isSearchStalled: PropTypes.bool,
  error: PropTypes.shape(),
  title: PropTypes.string.isRequired,
};

PopularResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
};

export default connectStateResults(PopularResults);
