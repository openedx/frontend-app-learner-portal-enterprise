import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import { Button } from '@edx/paragon';

import { FREE_ALL_ATTRIBUTE, QUERY_PARAMS_TO_IGNORE } from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';
import { updateRefinementsFromQueryParams } from './data/utils';

const ClearCurrentRefinements = ({ className, variant }) => {
  const history = useHistory();
  const refinementsFromQueryParams = useRefinementsFromQueryParams({ clearing: true });
  const { search } = useLocation();
  const queryParams = useMemo(
    () => qs.parse(search),
    [search],
  );

  /**
   * Called when clear filters button is clicked. Removes
   * all non-query keys from refinementsFromQueryParams and
   * updates the query params.
   */
  const handleClearAllRefinementsClick = () => {
    const refinements = { ...refinementsFromQueryParams };
    delete refinements.page; // reset to page 1

    Object.keys(queryParams).forEach((key) => {
      if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
        delete refinements[key];
      }
    });

    history.push({ search: qs.stringify(refinements) });
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
