import React, { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { JOBS_QUIZ_FACET_FILTERS } from './constants';

const SearchJobDropdown = () => {
  const { refinementsFromQueryParams } = useContext(SearchContext);
  const skillQuizFacets = useMemo(
    () => {
      const filtersFromRefinements = JOBS_QUIZ_FACET_FILTERS.map(({
        title, attribute, typeaheadOptions,
      }) => (
        <FacetListRefinement
          key={attribute}
          title={title}
          attribute={attribute}
          limit={300} // this is replicating the B2C search experience
          refinementsFromQueryParams={refinementsFromQueryParams}
          defaultRefinement={refinementsFromQueryParams[attribute]}
          facetValueType="array"
          typeaheadOptions={typeaheadOptions}
          searchable={!!typeaheadOptions}
        />
      ));
      return (
        <>
          {filtersFromRefinements}
        </>
      );
    },
    [refinementsFromQueryParams],
  );

  return (
    <>
      {skillQuizFacets}
    </>
  );
};

export default SearchJobDropdown;
