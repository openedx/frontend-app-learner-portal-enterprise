import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { CURRENT_JOB_FACET } from './constants';

function CurrentJobDropdown() {
  const { refinements } = useContext(SearchContext);
  const {
    title, attribute, typeaheadOptions, facetValueType, customAttribute,
  } = CURRENT_JOB_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={refinements[customAttribute]?.length > 0 ? refinements[customAttribute][0] : title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType={facetValueType}
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
      customAttribute={customAttribute}
      showBadge={false}
    />
  );
}

export default CurrentJobDropdown;
