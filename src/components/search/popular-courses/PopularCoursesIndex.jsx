import React from 'react';
import { Index, Configure } from 'react-instantsearch-dom';

import PopularCourses from './PopularCourses';

import { ALGOLIA_INDEX_NAME } from '../data/constants';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';

const PopularCoursesIndex = () => {
  const searchConfig = {
    query: '',
    hitsPerPage: NUM_RESULTS_TO_DISPLAY,
  };

  return (
    <Index indexName={ALGOLIA_INDEX_NAME} indexId="popular-courses">
      <Configure {...searchConfig} />
      <PopularCourses />
    </Index>
  );
};

export default PopularCoursesIndex;
