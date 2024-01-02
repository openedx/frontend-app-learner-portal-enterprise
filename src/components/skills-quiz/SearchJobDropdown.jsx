import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import PropTypes from 'prop-types';
import { DESIRED_JOB_FACET } from './constants';

const SearchJobDropdown = ({
  isStyleAutoSuggest,
  isChip,
  isStyleSearchBox,
}) => {
  const { refinements } = useContext(SearchContext);
  const { title, attribute, typeaheadOptions } = DESIRED_JOB_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={title}
      label={title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType="array"
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
      showBadge={false}
      variant="default"
      isStyleAutoSuggest={isStyleAutoSuggest}
      isChip={isChip}
      isStyleSearchBox={isStyleSearchBox}
    />
  );
};
SearchJobDropdown.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
  isChip: PropTypes.bool,
  isStyleSearchBox: PropTypes.bool,
};

SearchJobDropdown.defaultProps = {
  isStyleAutoSuggest: false,
  isChip: false,
  isStyleSearchBox: false,
};

export default SearchJobDropdown;
