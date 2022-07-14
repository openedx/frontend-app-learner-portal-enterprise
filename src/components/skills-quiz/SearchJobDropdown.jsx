import React, { useContext, useMemo } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';

import { DESIRED_JOB_FACET } from './constants';

const SearchJobDropdown = () => {
  const { refinements } = useContext(SearchContext);
  const { title, attribute, typeaheadOptions } = DESIRED_JOB_FACET;
  const jobsDropdown = useMemo(
    () => {
      const filtersFromRefinements = () => (
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
      return (
        <>
          {filtersFromRefinements()}
        </>
      );
    },
    [attribute, refinements, title, typeaheadOptions],
  );

  return (
    <>
      {jobsDropdown}
    </>
  );
};

export default SearchJobDropdown;
