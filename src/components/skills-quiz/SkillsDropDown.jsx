import React, { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { SKILLS_FACET } from './constants';

const SkillsDropDown = () => {
  const { refinements } = useContext(SearchContext);
  const {
    title, attribute, typeaheadOptions, facetValueType,
  } = SKILLS_FACET;
  const skillsDropdown = useMemo(
    () => {
      const filtersFromRefinements = () => (
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
      return (
        <>
          {filtersFromRefinements()}
        </>
      );
    },
    [JSON.stringify(refinements)],
  );

  return (
    <>
      {skillsDropdown}
    </>
  );
};

export default SkillsDropDown;
