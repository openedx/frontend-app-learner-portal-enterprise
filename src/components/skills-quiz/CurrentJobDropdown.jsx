import React, { useContext } from 'react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import FacetListRefinement from '@edx/frontend-enterprise-catalog-search/FacetListRefinement';
import PropTypes from 'prop-types';
import { CURRENT_JOB_FACET } from './constants';

const CurrentJobDropdown = ({ isStyleAutoSuggest, isChip }) => {
  const { refinements } = useContext(SearchContext);
  const {
    title,
    attribute,
    typeaheadOptions,
    facetValueType,
    customAttribute,
  } = CURRENT_JOB_FACET;

  return (
    <FacetListRefinement
      key={attribute}
      title={
        refinements[customAttribute]?.length > 0
          ? refinements[customAttribute][0]
          : title
      }
      label={title}
      attribute={attribute}
      limit={300} // this is replicating the B2C search experience
      refinements={refinements}
      facetValueType={facetValueType}
      typeaheadOptions={typeaheadOptions}
      searchable={!!typeaheadOptions}
      doRefinement={false}
      customAttribute={customAttribute}
      showBadge={false}
      variant="default"
      isStyleAutoSuggest={isStyleAutoSuggest}
      isChip={isChip}
    />
  );
};

CurrentJobDropdown.propTypes = {
  isStyleAutoSuggest: PropTypes.bool,
  isChip: PropTypes.bool,
};

CurrentJobDropdown.defaultProps = {
  isStyleAutoSuggest: false,
  isChip: false,
};

export default CurrentJobDropdown;
