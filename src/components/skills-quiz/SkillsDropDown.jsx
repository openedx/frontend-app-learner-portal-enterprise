import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { SKILLS_FACET } from './constants';

const SkillsDropDown = () => {
  const { refinements } = useContext(SearchContext);
  const {
    title, attribute, typeaheadOptions, facetValueType,
  } = SKILLS_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType={facetValueType}
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
    />
  );
};

export default SkillsDropDown;
