import React, { useContext } from 'react';
import {
  CardGrid,
} from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import CourseRunCard from './CourseRunCard';

const CourseRunCards = () => {
  const { state: courseData } = useContext(CourseContext);
  const {
    availableCourseRuns,
    userEntitlements,
    userEnrollments,
    catalog: { catalogList },
  } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => (
        <CourseRunCard
          userEnrollments={userEnrollments}
          courseRun={courseRun}
          catalogList={catalogList}
          userEntitlements={userEntitlements}
        />
      ))}
    </CardGrid>
  );
};

export default CourseRunCards;
