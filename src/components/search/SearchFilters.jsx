import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FacetList from './FacetList';

const searchFilters = [
  {
    attribute: 'subjects',
    title: 'Subject',
  },
  {
    attribute: 'partners',
    title: 'Partner',
  },
  {
    attribute: 'programs',
    title: 'Program',
  },
  {
    attribute: 'level_type',
    title: 'Level',
  },
  {
    attribute: 'availability',
    title: 'Availability',
  },
];

const SearchFilters = ({ className }) => (
  <div className={classNames('d-flex', className)}>
    {searchFilters.map(({ title, attribute }) => (
      <FacetList key={attribute} title={title} attribute={attribute} limit={300} />
    ))}
  </div>
);

SearchFilters.propTypes = {
  className: PropTypes.string,
};

SearchFilters.defaultProps = {
  className: undefined,
};

export default SearchFilters;
