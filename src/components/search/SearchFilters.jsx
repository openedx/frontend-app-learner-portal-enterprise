import React, { useMemo } from 'react';
import { breakpoints } from '@edx/paragon';

import FacetList from './FacetList';
import CurrentRefinements from './CurrentRefinements';

import MobileFilterMenu from './MobileFilterMenu';

import { SEARCH_FACET_FILTERS } from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';
import { sortItemsByLabelAsc } from './data/utils';

import { useWindowSize } from '../../utils/hooks';

const SearchFilters = () => {
  const size = useWindowSize();

  const showMobileMenu = useMemo(
    () => size.width < breakpoints.small.maxWidth,
    [size],
  );

  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  const searchFacets = useMemo(
    () => SEARCH_FACET_FILTERS.map(({
      title, attribute, isSortedAlphabetical,
    }) => (
      <FacetList
        key={attribute}
        title={title}
        attribute={attribute}
        limit={300} // this is replicating the B2C search experience
        transformItems={(items) => {
          if (isSortedAlphabetical) {
            return sortItemsByLabelAsc(items);
          }
          return items;
        }}
        defaultRefinement={refinementsFromQueryParams[attribute]}
        refinementsFromQueryParams={refinementsFromQueryParams}
      />
    )),
    [refinementsFromQueryParams],
  );

  return (
    <>
      {showMobileMenu ? (
        <MobileFilterMenu className="mb-3">{searchFacets}</MobileFilterMenu>
      ) : (
        <>
          <div className="d-flex">{searchFacets}</div>
          <CurrentRefinements />
        </>
      )}
    </>
  );
};

export default SearchFilters;
