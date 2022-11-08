import React, { useContext } from 'react';
import {
  CardGrid,
} from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import CourseRunCard from './CourseRunCard';

const CourseRunCards = () => {
  const {
    state: courseData,
    subsidyRequestCatalogsApplicableToCourse,
  } = useContext(CourseContext);
  const {
    availableCourseRuns,
    userEntitlements,
    userEnrollments,
    catalog: { catalogList },
  } = courseData;

  const {
    course: {
      key,
      entitlements: courseEntitlements,
    },
  } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => (
        <CourseRunCard
          key={`course-run-card-${courseRun.key}`}
          courseKey={key}
          userEnrollments={userEnrollments}
          courseRun={courseRun}
          catalogList={catalogList}
          userEntitlements={userEntitlements}
          courseEntitlements={courseEntitlements}
          subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
        />
      ))}
    </CardGrid>
  );
};

export default CourseRunCards;
