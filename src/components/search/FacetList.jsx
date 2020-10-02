import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { useHistory } from 'react-router-dom';
import { Input, Dropdown } from '@edx/paragon';
import { connectRefinementList } from 'react-instantsearch-dom';
import classNames from 'classnames';

import { updateRefinementsFromQueryParams } from './data/utils';
import { NO_OPTIONS_FOUND } from './data/constants';

export const FacetListBase = ({
  title,
  attribute,
  items,
  currentRefinement,
  refinementsFromQueryParams,
}) => {
  const history = useHistory();

  /**
   * Handles when a facet option is toggled by either updating the appropriate
   * query parameter for the facet attribute, or removes the facet attribute if
   * there's no longer any selected options for that facet attribute.
   */
  const handleInputOnChange = (item) => {
    const refinements = { ...refinementsFromQueryParams };
    delete refinements.page; // reset to page 1

    if (item.value && item.value.length > 0) {
      refinements[attribute] = [...item.value];
    } else {
      delete refinements[attribute];
    }

    const updatedRefinements = updateRefinementsFromQueryParams(refinements);
    history.push({ search: qs.stringify(updatedRefinements) });
  };

  const renderItems = useCallback(
    () => {
      if (!items || !items.length) {
        return <span className="py-2 px-2">{NO_OPTIONS_FOUND}</span>;
      }

      return items.map(item => (
        <Dropdown.Item
          key={item.label}
          as="label"
          className="mb-0 py-3"
        >
          <Input
            type="checkbox"
            checked={item.isRefined}
            onChange={() => handleInputOnChange(item)}
          />
          <span className={classNames('facet-item-label', { 'is-refined': item.isRefined })}>
            {item.label}
          </span>
          <span className="badge badge-pill ml-2 bg-brand-primary text-brand-primary">
            {item.count}
          </span>
        </Dropdown.Item>
      ));
    },
    [items],
  );

  return (
    <div className="facet-list">
      <Dropdown className="mb-0 mr-md-3">
        <Dropdown.Toggle
          className={
            classNames(
              'bg-white', 'text-capitalize', 'rounded-0', 'border-0',
              'd-flex', 'justify-content-between', 'align-items-center', 'text-dark',
              { 'font-weight-bold': currentRefinement.length > 0 },
            )
          }
        >
          {title}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {renderItems()}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

FacetListBase.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  attribute: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentRefinement: PropTypes.arrayOf(PropTypes.string).isRequired,
  refinementsFromQueryParams: PropTypes.shape().isRequired,
};

export default connectRefinementList(FacetListBase);
