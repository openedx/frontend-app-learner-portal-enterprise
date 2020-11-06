import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { Badge, Button } from '@edx/paragon';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import ClearCurrentRefinements from './ClearCurrentRefinements';

import {
  QUERY_PARAMS_TO_IGNORE,
  NUM_CURRENT_REFINEMENTS_TO_DISPLAY,
} from './data/constants';
import {
  useActiveRefinementsAsFlatArray,
} from './data/hooks';
import { SearchContext } from './SearchContext';
import { removeFromRefinementArray, deleteRefinementAction } from './data/actions';

export const CurrentRefinementsBase = ({ items }) => {
  if (!items || !items.length) {
    return null;
  }

  const [showAllRefinements, setShowAllRefinements] = useState(false);
  const { refinementsFromQueryParams, dispatch } = useContext(SearchContext);

  const activeRefinementsAsFlatArray = useActiveRefinementsAsFlatArray(items);

  /**
   * Determines the correct number of active refinements to show at any
   * given time based on showAllRefinements.
   */
  const visibleActiveRefinements = useMemo(
    () => {
      if (showAllRefinements) {
        return activeRefinementsAsFlatArray;
      }
      return activeRefinementsAsFlatArray.slice(0, NUM_CURRENT_REFINEMENTS_TO_DISPLAY);
    },
    [activeRefinementsAsFlatArray, showAllRefinements],
  );

  /**
   * Removes the refinement that was clicked from the query params, which causes
   * the search results to update.
   */
  const handleRefinementBadgeClick = (item) => {
    if (showAllRefinements && visibleActiveRefinements.length - 1 <= NUM_CURRENT_REFINEMENTS_TO_DISPLAY) {
      setShowAllRefinements(false);
    }
    // if the refinement is found, remove it.
    const facetName = item.attribute;
    if (!QUERY_PARAMS_TO_IGNORE.includes(facetName) && refinementsFromQueryParams[facetName]
    && refinementsFromQueryParams[facetName].includes(item.label)) {
      if (refinementsFromQueryParams[facetName].length === 1) {
        dispatch(deleteRefinementAction(facetName));
      } else {
        dispatch(removeFromRefinementArray(facetName, item.label));
      }
    }
  };

  return (
    <ul className="list-unstyled d-flex flex-wrap align-items-center mb-0">
      {visibleActiveRefinements.map(item => (
        <li className="mr-2" key={item.label}>
          <Badge
            className="mb-2 font-weight-light"
            variant="light"
            onClick={() => handleRefinementBadgeClick(item)}
          >
            <span className="mr-2">{item.label}</span>
            <FontAwesomeIcon icon={faTimes} />
            <span className="sr-only">Remove the filter {item.label}</span>
          </Badge>
        </li>
      ))}
      {!showAllRefinements && activeRefinementsAsFlatArray.length > NUM_CURRENT_REFINEMENTS_TO_DISPLAY && (
        <li className="mr-2">
          <Badge
            className="mb-2 font-weight-light"
            variant="light"
            onClick={() => setShowAllRefinements(true)}
          >
            +{activeRefinementsAsFlatArray.length - NUM_CURRENT_REFINEMENTS_TO_DISPLAY}
            <span className="sr-only">Show all {activeRefinementsAsFlatArray.length} filters</span>
          </Badge>
        </li>
      )}
      {showAllRefinements && (
        <li className="mr-2">
          <Button
            className="text-white text-underline px-1 py-0 mb-2"
            variant="link"
            onClick={() => setShowAllRefinements(false)}
          >
            show less
          </Button>
        </li>
      )}
      <li>
        <ClearCurrentRefinements className="text-white text-underline px-1 py-0 mb-2" variant="link" />
      </li>
    </ul>
  );
};

CurrentRefinementsBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default connectCurrentRefinements(CurrentRefinementsBase);
