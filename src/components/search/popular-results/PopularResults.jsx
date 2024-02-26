import React from 'react';
import PropTypes from 'prop-types';
import { connectStateResults } from 'react-instantsearch-dom';
import { useNbHitsFromSearchResults } from '@edx/frontend-enterprise-catalog-search';
import { Skeleton, CardGrid } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';

import SearchError from '../SearchError';
import { isDefinedAndNotNull } from '../../../utils/common';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';
import { CARDGRID_COLUMN_SIZES } from '../constants';
import { getHitComponentFromTitle, getSkeletonCardFromTitle } from '../../utils/search';

const PopularResults = ({
  searchResults,
  isSearchStalled,
  error,
  title,
  numberResultsToDisplay,
}) => {
  const nbHits = useNbHitsFromSearchResults(searchResults);
  const hits = searchResults?.hits || [];
  const SkeletonCard = getSkeletonCardFromTitle(title);
  const HitComponent = getHitComponentFromTitle(title);

  return (
    <>
      <h2 className="mb-4">
        {isSearchStalled && (
          <Skeleton className="h2 d-block mb-3" width={240} />
        )}
      </h2>
      {isSearchStalled && (
        <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
          {[...Array(numberResultsToDisplay).keys()].map(resultNum => <SkeletonCard key={resultNum} />)}
        </CardGrid>
      )}
      {!isSearchStalled && nbHits > 0 && (
        <>
          <h2 className="mb-3">{`Popular ${title}`}</h2>
          <CardGrid columnSizes={CARDGRID_COLUMN_SIZES}>
            {hits.map(hit => <HitComponent key={uuidv4()} hit={hit} />)}
          </CardGrid>
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
  numberResultsToDisplay: PropTypes.number,
};

PopularResults.defaultProps = {
  searchResults: undefined,
  isSearchStalled: false,
  error: undefined,
  numberResultsToDisplay: NUM_RESULTS_TO_DISPLAY,
};

export default connectStateResults(PopularResults);
