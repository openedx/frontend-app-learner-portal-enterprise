import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { Collapsible, Input } from '@edx/paragon';
import { connectRefinementList } from 'react-instantsearch-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import OutsideClickHandler from 'react-outside-click-handler';

import { QUERY_PARAM_FOR_SEARCH_QUERY } from './data/constants';

import './styles/FacetList.scss';

const BaseFacetList = ({
  title,
  attribute,
  items,
  currentRefinement,
  refinementsFromQueryParams,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    function checkKeyAndCloseIfEsc({ key }) {
      if (key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', checkKeyAndCloseIfEsc);
    return () => { // on unmount, remove event listener
      document.removeEventListener('keydown', checkKeyAndCloseIfEsc);
    };
  }, []);

  const handleOutsideClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  /**
   * Handles when a facet option is toggled by either updating the appropriate
   * query parameter for the facet attribute, or removes the facet attribute if
   * there's no longer any selected options for that facet attribute.
   */
  const handleInputOnChange = (item) => {
    const refinements = { ...refinementsFromQueryParams };

    if (item.value && item.value.length > 0) {
      refinements[attribute] = [...item.value];
    } else {
      delete refinements[attribute];
    }

    Object.entries(refinements).forEach(([key, value]) => {
      if (key !== QUERY_PARAM_FOR_SEARCH_QUERY) {
        refinements[key] = value.join(',');
      }
    });

    history.push({ search: qs.stringify(refinements) });
  };

  const renderItems = useCallback(
    () => {
      if (!items.length) {
        return (
          <p>No options found.</p>
        );
      }

      return (
        <ul className="list-group">
          {items.map((item, index) => (
            <li key={item.label} className="list-group-item border-0">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor={`${attribute}-${index}`}>
                <Input
                  type="checkbox"
                  id={`${attribute}-${index}`}
                  checked={item.isRefined}
                  onChange={() => handleInputOnChange(item)}
                />
                <span className={classNames('facet-item-label', 'ml-1', { 'is-refined': item.isRefined })}>
                  {item.label}
                </span>
                <span className="badge badge-pill ml-2 bg-brand-primary text-brand-primary">
                  {item.count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      );
    },
    [attribute, items],
  );

  return (
    <div className="facet-list">
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        <Collapsible
          open={isOpen}
          onToggle={setIsOpen}
          title={(
            <div
              className={
                classNames(
                  'text-capitalize',
                  { 'font-weight-bold': currentRefinement.length > 0 },
                )
              }
            >
              {title}
            </div>
          )}
          iconWhenOpen={<small><FontAwesomeIcon icon={faChevronUp} /></small>}
          iconWhenClosed={<small><FontAwesomeIcon icon={faChevronDown} /></small>}
        >
          {renderItems()}
        </Collapsible>
      </OutsideClickHandler>
    </div>
  );
};

BaseFacetList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  attribute: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default connectRefinementList(BaseFacetList);
