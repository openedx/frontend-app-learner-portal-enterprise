import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@edx/paragon';
import classNames from 'classnames';

const FacetDropdown = ({ title, items, isBold }) => (
  <div className="facet-list">
    <Dropdown className="mb-0 mr-md-3">
      <Dropdown.Toggle
        className={
          classNames(
            'bg-white', 'text-capitalize', 'rounded-0', 'border-0',
            'd-flex', 'justify-content-between', 'align-items-center', 'text-dark',
            { 'font-weight-bold': { isBold } },
          )
        }
      >
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {items}
      </Dropdown.Menu>
    </Dropdown>
  </div>
);

FacetDropdown.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isBold: PropTypes.bool.isRequired,
};

export default FacetDropdown;
