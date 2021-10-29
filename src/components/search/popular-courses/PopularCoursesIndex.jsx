import React from 'react';
import PropTypes from 'prop-types';
import { Index, Configure } from 'react-instantsearch-dom';
import { getConfig } from '@edx/frontend-platform/';

import PopularCourses from './PopularCourses';
import { CONTENT_TYPE_COURSE, CONTENT_TYPE_PROGRAM, COURSE_TITLE } from '../constants';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';

const PopularCoursesIndex = ({ title }) => {
  const config = getConfig();
  const contentType = title === COURSE_TITLE ? CONTENT_TYPE_COURSE : CONTENT_TYPE_PROGRAM;
  const searchConfig = {
    query: '',
    hitsPerPage: NUM_RESULTS_TO_DISPLAY,
    filters: `content_type:${contentType}`,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={`popular-${title}`}>
      <Configure {...searchConfig} />
      <PopularCourses title={title} />
    </Index>
  );
};

PopularCoursesIndex.propTypes = {
  title: PropTypes.string.isRequired,
};

export default PopularCoursesIndex;
