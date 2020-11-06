import React from 'react';
import PropTypes from 'prop-types';
import { Input, Dropdown } from '@edx/paragon';
import classNames from 'classnames';

const FacetItem = ({
  handleInputOnChange, item, isChecked,
}) => (
  <Dropdown.Item
    key={item.label}
    as="label"
    className="mb-0 py-3"
  >
    <Input
      type="checkbox"
      checked={isChecked}
      onChange={() => handleInputOnChange(item)}
    />
    <span className={classNames('facet-item-label', { 'is-refined': isChecked })}>
      {item.label}
    </span>
    {item.count && (
      <span className="badge badge-pill ml-2 bg-brand-primary text-brand-primary">
        {item.count}
      </span>
    )}
  </Dropdown.Item>
);

FacetItem.propTypes = {
  handleInputOnChange: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    count: PropTypes.number,
    label: PropTypes.string.isRequired,
  }).isRequired,
};

export default FacetItem;
