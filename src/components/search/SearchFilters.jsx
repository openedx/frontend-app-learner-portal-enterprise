import React, { useMemo, useContext } from 'react';
import { breakpoints } from '@edx/paragon';

import FacetListRefinement from './FacetListRefinement';
import FacetListBase from './FacetListBase';
import CurrentRefinements from './CurrentRefinements';

import MobileFilterMenu from './MobileFilterMenu';

import {
  SEARCH_FACET_FILTERS, SHOW_ALL_NAME,
} from './data/constants';
import { sortItemsByLabelAsc } from './data/utils';

import { useWindowSize } from '../../utils/hooks';
import { SearchContext } from './SearchContext';
import { features } from '../../config';

export const FREE_ALL_TITLE = 'Free / All';

const SearchFilters = () => {
  const size = useWindowSize();
  const { refinementsFromQueryParams } = useContext(SearchContext);
  const showMobileMenu = useMemo(
    () => size.width < breakpoints.small.maxWidth,
    [size],
  );
  const freeAllItems = useMemo(() => [
    {
      label: 'Free to me',
      // flip the 1 to 0 or vice versa using boolean logic
      // eslint-disable-next-line no-bitwise
      value: refinementsFromQueryParams[SHOW_ALL_NAME] ^ 1,
    },
    {
      label: 'All courses',
      value: refinementsFromQueryParams[SHOW_ALL_NAME],
    },
  ], [refinementsFromQueryParams[SHOW_ALL_NAME]]);

  const searchFacets = useMemo(
    () => {
      const filtersFromRefinements = SEARCH_FACET_FILTERS.map(({
        title, attribute, isSortedAlphabetical,
      }) => (
        <FacetListRefinement
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
          refinementsFromQueryParams={refinementsFromQueryParams}
          defaultRefinement={refinementsFromQueryParams[attribute]}
          facetValueType="array"
        />
      ));
      return (
        <>
          {features.ENROLL_WITH_CODES && (
            <FacetListBase
              attribute={SHOW_ALL_NAME}
              facetValueType="bool"
              isBold
              items={freeAllItems}
              key={SHOW_ALL_NAME}
              title={FREE_ALL_TITLE}
            />
          )}
          {filtersFromRefinements}
        </>
      );
    },
    [refinementsFromQueryParams],
  );

  return (
    <>
      {showMobileMenu ? (
        <MobileFilterMenu className="mb-3">
          {searchFacets}
        </MobileFilterMenu>
      ) : (
        <>
          <div className="d-flex">
            {searchFacets}
          </div>
          <CurrentRefinements />
        </>
      )}
    </>
  );
};

export default SearchFilters;
