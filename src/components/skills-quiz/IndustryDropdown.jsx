import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { INDUSTRY_ATTRIBUTE_NAME, INDUSTRY_FACET } from './constants';

const IndustryDropdown = () => {
  const { refinements } = useContext(SearchContext);
  const {
    title, attribute, typeaheadOptions, facetValueType,
  } = INDUSTRY_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={refinements[INDUSTRY_ATTRIBUTE_NAME]?.length > 0 ? refinements[INDUSTRY_ATTRIBUTE_NAME][0] : title}
      attribute={attribute}
      defaultRefinement={refinements[INDUSTRY_ATTRIBUTE_NAME]}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType={facetValueType}
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      showBadge={false}
    />
  );
};

export default IndustryDropdown;
