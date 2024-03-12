import React, { useContext } from 'react';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { findUserEnrollmentForCourseRun } from './data/utils';
import { CourseContext } from './CourseContextProvider';

const CourseMaterialsButton = () => {
  const {
    state: {
      course,
      userEnrollments,
    },
  } = useContext(CourseContext);
  const intl = useIntl();
  let userEnrollment;
  for (const courseRun of course.courseRuns) { // eslint-disable-line no-restricted-syntax
    const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
      userEnrollments,
      key: courseRun.key,
    });
    if (userEnrollmentForCourseRun) {
      userEnrollment = userEnrollmentForCourseRun;
      break;
    }
  }

  if (!userEnrollment) {
    return null;
  }
  return (
    <>
      <br />
      <Button variant="brand" href={userEnrollment?.courseRunUrl}>
        {intl.formatMessage({
          id: 'enterprise.course.about.course.materials.button.label',
          defaultMessage: 'View course materials',
          description: 'Label for the button that allows the learner to view the course materials.',
        })}
      </Button>
    </>
  );
};

export default CourseMaterialsButton;
