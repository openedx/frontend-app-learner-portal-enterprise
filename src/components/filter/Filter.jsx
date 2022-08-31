import { Form } from '@edx/paragon';
import React from 'react';
import PropTypes from 'prop-types';

import { filterGroups } from '../enterprise-user-subsidy/data/constants';
import closeIcon from '../../assets/icons/close.svg';

const FilterGroup = ({
  options, label, onChange, active = [],
}) => (
  <div className="filter-group">
    <h4 className="filter-group__title">{label}</h4>
    {options.map((option) => (
      <div key={option.value} className="filter-group__item">
        <Form.Checkbox
          checked={active.includes(option.value.toString())}
          onChange={onChange}
          value={option.value}
        >
          {option.label}
        </Form.Checkbox>
      </div>
    ))}
  </div>
);

export const Filter = ({ filter }) => {
  const handleChange = (group) => (event) => {
    const { value, checked } = event.target;
    let newGroup = [...filter.current[group]];
    if (checked) { newGroup = newGroup.concat(value); } else { newGroup = newGroup.filter((item) => item !== value); }
    filter.set({
      ...filter.current,
      [group]: newGroup,
    });
  };
  return (
    <>
      <h3 className="mb-4">Filter by</h3>
      {filterGroups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index !== 0 && <hr />}
          <FilterGroup
            options={filter.options[group.id]}
            active={filter.current[group.id]}
            label={group.label}
            onChange={handleChange(group.id)}
          />
        </React.Fragment>
      ))}
    </>
  );
};

const ActiveFilterTag = ({ children, onClick }) => (
  <span className="active-filter__tag">
    {children}
    <button onClick={onClick} className="active-filter__icon" type="button">
      <img
        src={closeIcon}
        alt="Remove this filter"
      />
    </button>
  </span>
);

export const ActiveFilter = ({ filter }) => {
  const activeFilters = filterGroups.reduce((accumulator, group) => accumulator.concat(
    filter.options[group.id]
      .filter((option) => filter.current[group.id].includes(option.value.toString()))
      .map((item) => ({ ...item, group: group.id })),
  ), []);

  const handleChange = (group, value) => {
    filter.set({
      ...filter.current,
      [group]: filter.current[group].filter((item) => item !== value),
    });
  };

  return (
    <div className="active-filter">
      {activeFilters.map((item) => (
        <ActiveFilterTag
          onClick={() => handleChange(item.group, item.value.toString())}
          key={`${item.group}-${item.value}`}
        >
          {item.label}
        </ActiveFilterTag>
      ))}
    </div>
  );
};

const filterPropTypes = PropTypes.shape({
  set: PropTypes.func.isRequired,
  current: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))).isRequired,
  options: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }))).isRequired,
});

Filter.propTypes = {
  filter: filterPropTypes.isRequired,
};

FilterGroup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  })).isRequired,
  label: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  active: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

FilterGroup.defaultProps = {
  active: [],
};

ActiveFilter.propTypes = {
  filter: filterPropTypes.isRequired,
};

ActiveFilterTag.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
