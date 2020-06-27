import React from 'react';
import PropTypes from 'prop-types';
import {
  Index, Configure, Hits, connectStats,
} from 'react-instantsearch-dom';

import SearchCourseCard from './SearchCourseCard';

import { ALGOLIA_INDEX_NAME } from './data/constants';

const PopularCoursesBase = ({ nbHits }) => {
  if (nbHits === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4">Popular Courses</h2>
      <Hits hitComponent={SearchCourseCard} />
    </>
  );
};

const PopularCourses = connectStats(PopularCoursesBase);

const PopularCoursesWithIndex = () => {
  const searchConfig = {
    query: '',
    hitsPerPage: 4,
  };

  return (
    <Index indexName={ALGOLIA_INDEX_NAME} indexId="popular-courses">
      <Configure {...searchConfig} />
      <PopularCourses />
    </Index>
  );
};

PopularCoursesBase.propTypes = {
  nbHits: PropTypes.number.isRequired,
};

export default PopularCoursesWithIndex;
