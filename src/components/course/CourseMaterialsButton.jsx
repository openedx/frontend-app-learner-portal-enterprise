import React, { useContext } from 'react';
import { Button } from '@edx/paragon';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { CourseContext } from './CourseContextProvider';

const CourseMaterialsButton = () => {
  const {
    state: {
      course,
      userEnrollments,
    },
  } = useContext(CourseContext);

  let enrolledCourseRun;
  let userEnrollment;
  for (const courseRun of course.courseRuns) { // eslint-disable-line no-restricted-syntax
    const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
      userEnrollments,
      key: courseRun.key,
    });
    if (userEnrollmentForCourseRun) {
      userEnrollment = userEnrollmentForCourseRun;
      enrolledCourseRun = courseRun;
      break;
    }
  }

  if (!enrolledCourseRun) {
    return null;
  }
  return (
    <>
      <br />
      <Button variant="brand" href={userEnrollment.courseRunUrl}>
        View course materials
      </Button>
    </>
  );
};

export default CourseMaterialsButton;
