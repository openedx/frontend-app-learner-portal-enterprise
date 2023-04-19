import React, { useContext } from 'react';
import { CardGrid } from '@edx/paragon';

import DeprecatedCourseRunCards from './deprecated/CourseRunCards';

import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';

/**
 * TODO
 * @returns
 */
/* istanbul ignore next */
const CourseRunCards = () => {
  const { state: courseData } = useContext(CourseContext);
  const { availableCourseRuns } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => (
        <CourseRunCard key={courseRun.uuid} courseRun={courseRun} />
      ))}
    </CardGrid>
  );
};

/* istanbul ignore next */
CourseRunCards.Deprecated = DeprecatedCourseRunCards;

export default CourseRunCards;
