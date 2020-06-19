import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { connectCurrentRefinements } from 'react-instantsearch-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export const NUM_CURRENT_REFINEMENTS_TO_DISPLAY = 3;

const CurrentRefinements = ({ items, refine }) => {
  if (!items || !items.length) {
    return null;
  }

  const [showAllRefinements, setShowAllRefinements] = useState(false);

  const activeRefinements = useMemo(
    () => {
      const refinements = [];
      items.forEach(({ items: activeSelectionsForAttribute }) => {
        refinements.push(...activeSelectionsForAttribute);
      });
      return refinements;
    },
    [items],
  );

  const visibleActiveRefinements = useMemo(
    () => {
      if (showAllRefinements) {
        return activeRefinements;
      }
      return activeRefinements.slice(0, NUM_CURRENT_REFINEMENTS_TO_DISPLAY);
    },
    [activeRefinements, showAllRefinements],
  );

  return (
    <ul className="list-unstyled d-flex flex-wrap align-items-center">
      {visibleActiveRefinements.map(({ label, value }) => (
        <li className="mr-2" key={label}>
          <Button
            className="badge badge-light font-weight-light"
            onClick={() => {
              if (showAllRefinements && visibleActiveRefinements.length - 1 <= NUM_CURRENT_REFINEMENTS_TO_DISPLAY) {
                setShowAllRefinements(false);
              }
              refine(value);
            }}
          >
            <span className="mr-2">{label}</span>
            <FontAwesomeIcon icon={faTimes} />
            <span className="sr-only">Remove the filter {label}</span>
          </Button>
        </li>
      ))}
      {!showAllRefinements && activeRefinements.length > NUM_CURRENT_REFINEMENTS_TO_DISPLAY && (
        <li className="mr-2">
          <Button
            className="badge badge-light font-weight-light"
            onClick={() => setShowAllRefinements(true)}
          >
            +{activeRefinements.length - NUM_CURRENT_REFINEMENTS_TO_DISPLAY}
            <span className="sr-only">Show all {activeRefinements.length} filters</span>
          </Button>
        </li>
      )}
      {showAllRefinements && (
        <li className="mr-2">
          <Button
            className="text-white text-underline px-1 py-0"
            onClick={() => setShowAllRefinements(false)}
          >
            show less
          </Button>
        </li>
      )}
      <li>
        <Button
          className="text-white text-underline px-1 py-0"
          onClick={() => refine(items)}
        >
          clear all
        </Button>
      </li>
    </ul>
  );
};

CurrentRefinements.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  refine: PropTypes.func.isRequired,
};

export default connectCurrentRefinements(CurrentRefinements);
