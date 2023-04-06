import React, { useContext } from 'react';
import moment from 'moment';
import { Button, CardGrid } from '@edx/paragon';

import DeprecatedCourseRunCards from './deprecated/CourseRunCards';

import StatefulEnroll from '../../stateful-enroll';
import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';
import { isCourseSelfPaced, findUserEnrollmentForCourseRun } from '../data/utils';
import { formatStringAsNumber } from '../../../utils/common';

const DATE_FORMAT = 'MMM D';

const getHeadingText = ({
  isCourseRunCurrent,
  pacingType,
  start,
  isUserEnrolled,
}) => {
  if (isCourseRunCurrent) {
    if (isCourseSelfPaced(pacingType) && !isUserEnrolled) {
      return `Starts ${moment().format(DATE_FORMAT)}`;
    }
    return 'Course started';
  }
  return `Starts ${moment(start).format(DATE_FORMAT)}`;
};

const getCourseRunCardProps = ({
  courseRun,
  isUserEnrolled,
}) => {
  const {
    availability,
    start,
    pacingType,
  } = courseRun;
  const isCourseRunCurrent = availability.toLowerCase() === 'current';
  const heading = getHeadingText({
    isCourseRunCurrent,
    pacingType,
    start,
    isUserEnrolled,
  });

  if (isUserEnrolled) {
    return {
      heading,
      subHeading: 'You are enrolled',
      // TODO link to courseware_url from API response.
      action: <Button>View course</Button>,
    };
  }

  const { enrollmentCount } = courseRun;
  const subHeading = enrollmentCount > 0 ? `${formatStringAsNumber(enrollmentCount)} recently enrolled!` : 'Be the first to enroll!';

  return {
    heading,
    subHeading,
    action: <StatefulEnroll contentKey={courseRun.key} />,
  };
};

const CourseRunCards = () => {
  const { state: courseData } = useContext(CourseContext);
  const {
    availableCourseRuns,
    userSubsidyApplicableToCourse,
    userEnrollments,
  } = courseData;

  return (
    <CardGrid columnSizes={{ sm: 12, lg: 5 }}>
      {availableCourseRuns.map((courseRun) => {
        const courseRunCardProps = getCourseRunCardProps({
          userSubsidyApplicableToCourse,
          courseRun,
          // TODO: knowing whether the user is enrolled in a course run will ultimately be derived from the
          // EMET `can_redeem` API response in enterprise-access. To remain backwards compatible with other
          // subsidy types beyond EMET learner credit, we will continue to cross-check against enrollments
          // returned by the existing API call.
          isUserEnrolled: findUserEnrollmentForCourseRun({
            userEnrollments,
            key: courseRun.key,
          }),
        });

        return (
          <CourseRunCard
            key={courseRun.uuid}
            {...courseRunCardProps}
          />
        );
      })}
    </CardGrid>
  );
};

CourseRunCards.Deprecated = DeprecatedCourseRunCards;

export default CourseRunCards;
