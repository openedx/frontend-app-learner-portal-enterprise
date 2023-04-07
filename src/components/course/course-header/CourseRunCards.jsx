import React, { useContext } from 'react';
import { CardGrid } from '@edx/paragon';

import DeprecatedCourseRunCards from './deprecated/CourseRunCards';

import { CourseContext } from '../CourseContextProvider';
import CourseRunCard from './CourseRunCard';
import { findUserEnrollmentForCourseRun } from '../data/utils';

import { getCourseRunCardProps } from './data';

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
        const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
          userEnrollments,
          key: courseRun.key,
        });
        const courseRunCardProps = getCourseRunCardProps({
          courseRun,
          userSubsidyApplicableToCourse,
          // TODO: determining whether the user is enrolled in a course run will ultimately be derived from
          // the EMET `can_redeem` API response in enterprise-access. To remain backwards compatible with other
          // subsidy types beyond EMET learner credit, we will continue to cross-check against enrollments
          // returned by the existing API call.
          isUserEnrolled: !!userEnrollmentForCourseRun,
          // TODO: URL to courseware will get pulled from EMET `can_redeem` API instead during the redemption
          // flow. Without the API integration in place yet, temporarily uses `courseRunUrl` associated with
          // the user's enterprise enrollment record, which we already have the data for.
          courseRunUrl: userEnrollmentForCourseRun?.courseRunUrl,
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
