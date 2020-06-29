import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { Collapsible, Input } from '@edx/paragon';
import { connectRefinementList } from 'react-instantsearch-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@edx/frontend-platform/react';

import './styles/FacetList.scss';

const BaseFacetList = ({
  title,
  attribute,
  items,
  currentRefinement,
  refine,
}) => {
  const { enterpriseConfig: { branding } } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);

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
                  onChange={() => refine(item.value)}
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
    [items, branding],
  );

  return (
    <div className="facet-list">
      <Collapsible
        className="mr-3 rounded-0"
        open={isOpen}
        onToggle={setIsOpen}
        title={(
          <div
            className={classNames('text-capitalize', { 'font-weight-bold': currentRefinement.length > 0 })}
          >
            {title}
          </div>
        )}
        iconWhenOpen={<small><FontAwesomeIcon icon={faChevronUp} /></small>}
        iconWhenClosed={<small><FontAwesomeIcon icon={faChevronDown} /></small>}
      >
        {renderItems()}
      </Collapsible>
    </div>
  );
};

BaseFacetList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  attribute: PropTypes.string.isRequired,
  refine: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default connectRefinementList(BaseFacetList);
