import React, { useMemo, useContext } from 'react';
import { breakpoints } from '@edx/paragon';

import FacetList from './FacetListRefinement';
import FacetListFreeAll from './FacetListFreeAll';
import CurrentRefinements from './CurrentRefinements';

import MobileFilterMenu from './MobileFilterMenu';

import { SEARCH_FACET_FILTERS } from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';
import { sortItemsByLabelAsc } from './data/utils';

import { useWindowSize } from '../../utils/hooks';
import { SearchContext } from './SearchContext';
import { features } from '../../config';

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
      value: !showAllCatalogs,
    },
    {
      label: 'All Courses',
      value: showAllCatalogs,
    },
  ], [showAllCatalogs]);

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
        <MobileFilterMenu className="mb-3">
          {features.ENROLL_WITH_CODES && (
            <FacetListFreeAll
              items={freeAllItems}
              showAllCatalogs={showAllCatalogs}
              setShowAllCatalogs={setShowAllCatalogs}
              title="Free/All"
              refinementsFromQueryParams={refinementsFromQueryParams}
            />
          )}
          {searchFacets}
        </MobileFilterMenu>
      ) : (
        <>
          <div className="d-flex">
            {features.ENROLL_WITH_CODES && (
              <FacetListFreeAll
                items={freeAllItems}
                showAllCatalogs={showAllCatalogs}
                setShowAllCatalogs={setShowAllCatalogs}
                title="Free/All"
                refinementsFromQueryParams={refinementsFromQueryParams}
              />
            )}
            {searchFacets}
          </div>
          <CurrentRefinements />
        </>
      )}
    </>
  );
};

export default SearchFilters;
