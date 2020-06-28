import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { Button } from '@edx/paragon';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import ClearCurrentRefinements from './ClearCurrentRefinements';

import {
  NUM_CURRENT_REFINEMENTS_TO_DISPLAY,
  QUERY_PARAMS_TO_IGNORE,
} from './data/constants';
import {
  useRefinementsFromQueryParams,
  useActiveRefinementsAsFlatArray,
} from './data/hooks';

const CurrentRefinements = ({ items, refine }) => {
  if (!items || !items.length) {
    return null;
  }

  const history = useHistory();
  const [showAllRefinements, setShowAllRefinements] = useState(false);
  const refinementsFromQueryParams = useRefinementsFromQueryParams();

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

    refine(item.value);

    const refinements = { ...refinementsFromQueryParams };
    delete refinements.page; // reset to page 1

    Object.entries(refinements).forEach(([key, value]) => {
      if (!QUERY_PARAMS_TO_IGNORE.includes(key)) {
        const updatedValue = [...value];
        const foundIndex = updatedValue.findIndex(facetLabel => facetLabel === item.label);

        // if the refinement is found, remove it.
        if (key === item.attribute && foundIndex !== -1) {
          updatedValue.splice(foundIndex, 1);
        }

        if (updatedValue.length > 0) {
          refinements[key] = updatedValue.join(',');
        } else {
          delete refinements[key];
        }
      }
    });

    history.push({ search: qs.stringify(refinements) });
  };

  return (
    <ul className="list-unstyled d-flex flex-wrap align-items-center mb-0">
      {visibleActiveRefinements.map(item => (
        <li className="mr-2" key={item.label}>
          <Button
            className="badge badge-light mb-2 font-weight-light"
            onClick={() => handleRefinementBadgeClick(item)}
          >
            <span className="mr-2">{item.label}</span>
            <FontAwesomeIcon icon={faTimes} />
            <span className="sr-only">Remove the filter {item.label}</span>
          </Button>
        </li>
      ))}
      {!showAllRefinements && activeRefinementsAsFlatArray.length > NUM_CURRENT_REFINEMENTS_TO_DISPLAY && (
        <li className="mr-2">
          <Button
            className="badge badge-light mb-2 font-weight-light"
            onClick={() => setShowAllRefinements(true)}
          >
            +{activeRefinementsAsFlatArray.length - NUM_CURRENT_REFINEMENTS_TO_DISPLAY}
            <span className="sr-only">Show all {activeRefinementsAsFlatArray.length} filters</span>
          </Button>
        </li>
      )}
      {showAllRefinements && (
        <li className="mr-2">
          <Button
            className="text-white text-underline px-1 py-0 mb-2"
            onClick={() => setShowAllRefinements(false)}
          >
            show less
          </Button>
        </li>
      )}
      <li>
        <ClearCurrentRefinements className="text-white text-underline px-1 py-0 mb-2" />
      </li>
    </ul>
  );
};

CurrentRefinements.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectCurrentRefinements(CurrentRefinements);
