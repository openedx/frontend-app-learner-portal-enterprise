import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { Button } from '@edx/paragon';

import { QUERY_PARAMS_TO_IGNORE } from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';

const ClearCurrentRefinements = ({ className }) => {
  const history = useHistory();
  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  /**
   * Called when clear filters button is clicked. Removes
   * all non-query keys from refinementsFromQueryParams and
   * updates the query params.
   */
  const handleClearAllRefinementsClick = () => {
    const refinements = { ...refinementsFromQueryParams };

    // reset to page 1
    delete refinements.page;

    Object.keys(refinements).forEach((key) => {
      if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
        delete refinements[key];
      }
    });
    history.push({ search: qs.stringify(refinements) });
  };

  return (
    <Button
      className={className}
      onClick={handleClearAllRefinementsClick}
    >
      clear all
    </Button>
  );
};

ClearCurrentRefinements.propTypes = {
  className: PropTypes.string,
};

ClearCurrentRefinements.defaultProps = {
  className: undefined,
};

export default ClearCurrentRefinements;
