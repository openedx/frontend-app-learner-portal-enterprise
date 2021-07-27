import React, { useContext, useMemo } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { getConfig } from '@edx/frontend-platform/config';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { JOBS_QUIZ_FACET_FILTERS } from './constants';

const SearchJobDropdown = () => {
  const config = getConfig();
  const searchClient = algoliasearch(
    config.ALGOLIA_APP_ID,
    config.ALGOLIA_SEARCH_API_KEY,
  );
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
