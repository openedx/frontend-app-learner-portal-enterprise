import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { INDUSTRY_FACET } from './constants';

const IndustryDropDown = () => {
  const { refinements } = useContext(SearchContext);
  const { title, attribute, typeaheadOptions } = INDUSTRY_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType="single-item"
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
      showBadge={false}
    />
  );
};

export default IndustryDropDown;
