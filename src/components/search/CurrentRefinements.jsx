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
  QUERY_PARAM_FOR_SEARCH_QUERY,
} from './data/constants';
import { useRefinementsFromQueryParams } from './data/hooks';

const CurrentRefinements = ({ items }) => {
  if (!items || !items.length) {
    return null;
  }

  const history = useHistory();
  const [showAllRefinements, setShowAllRefinements] = useState(false);

  const activeRefinementsByAttribute = useMemo(
    () => {
      const refinements = {};
      items.forEach((facet) => {
        const { attribute } = facet;
        refinements[attribute] = facet.items;
      });
      return refinements;
    },
    [items],
  );

  const activeRefinementsAsFlatArray = useMemo(
    () => {
      const refinements = [];
      Object.entries(activeRefinementsByAttribute).forEach(([key, value]) => {
        const updatedValue = [...value].map((item) => ({
          ...item,
          attribute: key,
        }));
        refinements.push(...updatedValue);
      });
      return refinements;
    },
    [activeRefinementsByAttribute],
  );

  const visibleActiveRefinements = useMemo(
    () => {
      if (showAllRefinements) {
        return activeRefinementsAsFlatArray;
      }
      return activeRefinementsAsFlatArray.slice(0, NUM_CURRENT_REFINEMENTS_TO_DISPLAY);
    },
    [activeRefinementsAsFlatArray, showAllRefinements],
  );

  const refinementsFromQueryParams = useRefinementsFromQueryParams();

  const handleRefinementBadgeClick = (item) => {
    const refinements = { ...refinementsFromQueryParams };

    Object.entries(refinements).forEach(([key, value]) => {
      if (key !== QUERY_PARAM_FOR_SEARCH_QUERY) {
        const updatedValue = [...value];
        const foundIndex = updatedValue.findIndex(facetLabel => facetLabel === item.label);

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

    if (showAllRefinements && visibleActiveRefinements.length - 1 <= NUM_CURRENT_REFINEMENTS_TO_DISPLAY) {
      setShowAllRefinements(false);
    }

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
};

export default connectCurrentRefinements(CurrentRefinements);
