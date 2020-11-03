import React, { useMemo, useContext } from 'react';
import { breakpoints } from '@edx/paragon';

import FacetListRefinement from './FacetListRefinement';
import FacetListBase from './FacetListBase';
import CurrentRefinements from './CurrentRefinements';

import MobileFilterMenu from './MobileFilterMenu';

import {
  SEARCH_FACET_FILTERS, FREE_ALL_ATTRIBUTE, SHOW_ALL_NAME,
} from './data/constants';
import { sortItemsByLabelAsc } from './data/utils';

import { useWindowSize } from '../../utils/hooks';
import { SearchContext } from './SearchContext';
import { features } from '../../config';

export const FREE_ALL_TITLE = 'Free / All';

const SearchFilters = () => {
  const size = useWindowSize();
  const { activeRefinements, refinementsDispatch: dispatch } = useContext(SearchContext);
  const showMobileMenu = useMemo(
    () => size.width < breakpoints.small.maxWidth,
    [size],
  );

  const freeAllItems = useMemo(() => [
    {
      label: 'Free to me',
      // eslint-disable-next-line no-bitwise
      value: activeRefinements[SHOW_ALL_NAME] ^ 1,
      name: SHOW_ALL_NAME,
    },
    {
      label: 'All courses',
      value: activeRefinements[SHOW_ALL_NAME],
      name: SHOW_ALL_NAME,
    },
  ], [activeRefinements[SHOW_ALL_NAME]]);

  const searchFacets = useMemo(
    () => {
      const filtersFromRefinements = SEARCH_FACET_FILTERS.map(({
        title, attribute, isSortedAlphabetical, name,
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
          refinementsFromQueryParams={activeRefinements}
          defaultRefinement={activeRefinements[attribute]}
          facetName={name}
          facetValueType="array"
          dispatch={dispatch}
        />
      ));
      return (
        <>
          {features.ENROLL_WITH_CODES && (
            <FacetListBase
              key={FREE_ALL_ATTRIBUTE}
              items={freeAllItems}
              title={FREE_ALL_TITLE}
              facetName={FREE_ALL_ATTRIBUTE}
              facetValueType="bool"
              refinementsFromQueryParams={activeRefinements}
              dispatch={dispatch}
              isBold
            />
          )}
          {filtersFromRefinements}
        </>
      );
    },
    [activeRefinements],
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
