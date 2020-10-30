import React, { useMemo, useContext } from 'react';
import { breakpoints } from '@edx/paragon';

import FacetList from './FacetListRefinement';
import FacetListFreeAll from './FacetListFreeAll';
import CurrentRefinements from './CurrentRefinements';

import MobileFilterMenu from './MobileFilterMenu';

import { SEARCH_FACET_FILTERS, FREE_ALL_ATTRIBUTE, SHOW_ALL_NAME, FREE_TO_ME_NAME } from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';
import { sortItemsByLabelAsc } from './data/utils';

import { useWindowSize } from '../../utils/hooks';
import { SearchContext } from './SearchContext';
import { features } from '../../config';

export const FREE_ALL_TITLE = 'Free / All';

const SearchFilters = () => {
  const size = useWindowSize();
  const { showAllCatalogs, setShowAllCatalogs } = useContext(SearchContext);
  const showMobileMenu = useMemo(
    () => size.width < breakpoints.small.maxWidth,
    [size],
  );

  const freeAllItems = useMemo(() => [
    {
      label: 'Free to me',
      // eslint-disable-next-line no-bitwise
      value: showAllCatalogs ^ 1,
      name: FREE_TO_ME_NAME,
    },
    {
      label: 'All courses',
      value: showAllCatalogs,
      name: SHOW_ALL_NAME,
    },
  ], [showAllCatalogs]);

  const refinementsFromQueryParams = useRefinementsFromQueryParams();
  console.log('REFINEMENTS FROM QUERY SearchFilters', refinementsFromQueryParams)

  const searchFacets = useMemo(
    () => {
      const filtersFromRefinements = SEARCH_FACET_FILTERS.map(({
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
      ));
      return (
        <>
          {features.ENROLL_WITH_CODES && (
            <FacetListFreeAll
              key={FREE_ALL_ATTRIBUTE}
              items={freeAllItems}
              showAllCatalogs={showAllCatalogs}
              setShowAllCatalogs={setShowAllCatalogs}
              title={FREE_ALL_TITLE}
              refinementsFromQueryParams={refinementsFromQueryParams}
              attribute={FREE_ALL_ATTRIBUTE}
            />
          )}
          {filtersFromRefinements}
        </>
      );
    },
    [refinementsFromQueryParams, showAllCatalogs],
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
