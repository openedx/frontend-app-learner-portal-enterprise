import React from 'react';
import { Index, Configure } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/';

import PopularCourses from './PopularCourses';

import { NUM_RESULTS_TO_DISPLAY } from './data/constants';

const PopularCoursesIndex = () => {
  const config = getConfig();
  const searchConfig = {
    query: '',
    hitsPerPage: NUM_RESULTS_TO_DISPLAY,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId="popular-courses">
      <Configure {...searchConfig} />
      <PopularCourses />
    </Index>
  );
};

export default PopularCoursesIndex;
