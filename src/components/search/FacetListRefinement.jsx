import React from 'react';
import PropTypes from 'prop-types';

import { connectRefinementList } from 'react-instantsearch-dom';
import FacetListBase from './FacetListBase';

export const FacetListRefinementBase = ({
  currentRefinement, ...props
}) => (
  <FacetListBase
    isBold={currentRefinement.length > 0}
    isCheckedField="isRefined"
    {...props}
  />
);

FacetListRefinementBase.propTypes = {
  attribute: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
  title: PropTypes.string.isRequired,
};

export default connectRefinementList(FacetListRefinementBase);
