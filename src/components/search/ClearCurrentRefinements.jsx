import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { SearchContext } from './SearchContext';
import { clearFiltersAction } from './data/actions';

const ClearCurrentRefinements = ({ className, variant }) => {
  // const history = useHistory();
  const { refinementsDispatch } = useContext(SearchContext);

  /**
   * Called when clear filters button is clicked. Removes
   * all non-query keys from refinementsFromQueryParams and
   * updates the query params.
   */
  const handleClearAllRefinementsClick = () => {
    refinementsDispatch(clearFiltersAction());
  };

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleClearAllRefinementsClick}
    >
      clear all
    </Button>
  );
};

ClearCurrentRefinements.propTypes = {
  variant: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ClearCurrentRefinements.defaultProps = {
  className: undefined,
};

export default ClearCurrentRefinements;
