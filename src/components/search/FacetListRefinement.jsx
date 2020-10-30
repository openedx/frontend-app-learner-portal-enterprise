import React from 'react';
import PropTypes from 'prop-types';

import { connectRefinementList } from 'react-instantsearch-dom';
import FacetListBase from './FacetListBase';

export const FacetListRefinementBase = ({
  currentRefinement, ...props
}) => (
  <FacetListBase
    isBold={currentRefinement.length > 0}
    isCheckedOrRefinedField="isRefined"
    {...props}
  />
);

FacetListRefinementBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  attribute: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default connectRefinementList(FacetListRefinementBase);
