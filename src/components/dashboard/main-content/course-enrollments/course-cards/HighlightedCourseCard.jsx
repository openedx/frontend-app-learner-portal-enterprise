import React from 'react';
import PropTypes from 'prop-types';

import SearchCourseCard from '../../../../search/SearchCourseCard';

import { COURSE_STATUSES } from '../data/constants';

const HighlightedCourseCard = (props) => (
  <SearchCourseCard
    {...props}
  />
);

HighlightedCourseCard.propTypes = {
  hit: PropTypes.shape({
    key: PropTypes.string,
    title: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

HighlightedCourseCard.defaultProps = {
  hit: undefined,
  isLoading: false,
};

export default HighlightedCourseCard;
