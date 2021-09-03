import React, { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { CURRENT_JOB_FACET } from './constants';

const CurrentJobDropdown = () => {
  const { refinements } = useContext(SearchContext);
  const {
    title, attribute, typeaheadOptions, facetValueType, customAttribute,
  } = CURRENT_JOB_FACET;
  const currentJobDropdown = useMemo(
    () => {
      const filtersFromRefinements = () => (
        <FacetListRefinement
          key={attribute}
          title={refinements[customAttribute] ? refinements[customAttribute] : title}
          attribute={attribute}
          limit={300} // this is replicating the B2C search experience
          refinements={refinements}
          facetValueType={facetValueType}
          typeaheadOptions={typeaheadOptions}
          searchable={!!typeaheadOptions}
          doRefinement={false}
          customAttribute={customAttribute}
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
      {currentJobDropdown}
    </>
  );
};

export default CurrentJobDropdown;
