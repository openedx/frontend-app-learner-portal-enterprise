import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { DESIRED_JOB_FACET } from './constants';

function SearchJobDropdown() {
  const { refinements } = useContext(SearchContext);
  const { title, attribute, typeaheadOptions } = DESIRED_JOB_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType="array"
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
      showBadge={false}
    />
  );
}

export default SearchJobDropdown;
