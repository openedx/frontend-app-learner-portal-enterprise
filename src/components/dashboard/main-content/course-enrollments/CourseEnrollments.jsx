import React, { useContext, useMemo } from 'react';

import PropTypes from 'prop-types';
import CourseSection from './CourseSection';

import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import { CourseEnrollmentsContext } from './CourseEnrollmentsContextProvider';
import { sortedEnrollmentsByEnrollmentDate } from './data/utils';

export const COURSE_SECTION_TITLES = {
  current: 'My courses',
  completed: 'Completed courses',
  savedForLater: 'Saved for later',
};

function CourseEnrollments({ children }) {
  const {
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
  } = useContext(CourseEnrollmentsContext);

  const currentCourseEnrollments = useMemo(() => sortedEnrollmentsByEnrollmentDate(
    [
      ...courseEnrollmentsByStatus.inProgress, ...courseEnrollmentsByStatus.upcoming,
      ...courseEnrollmentsByStatus.requested,
    ],
  ), [
    courseEnrollmentsByStatus.inProgress,
    courseEnrollmentsByStatus.upcoming,
    courseEnrollmentsByStatus.requested,
  ]);

  const completedCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.completed),
    [courseEnrollmentsByStatus.completed],
  );

  const savedForLaterCourseEnrollments = useMemo(
    () => sortedEnrollmentsByEnrollmentDate(courseEnrollmentsByStatus.savedForLater),
    [courseEnrollmentsByStatus.savedForLater],
  );

  if (fetchCourseEnrollmentsError) {
    return (
      <CourseEnrollmentsAlert variant="danger">
        An error occurred while retrieving your course enrollments. Please try again.
      </CourseEnrollmentsAlert>
    );
  }

  const hasCourseEnrollments = Object.values(courseEnrollmentsByStatus).flat().length > 0;

  return (
    <>
      {showMarkCourseCompleteSuccess && (
        <CourseEnrollmentsAlert variant="success" onClose={() => setShowMarkCourseCompleteSuccess(false)}>
          Your course was saved for later.
        </CourseEnrollmentsAlert>
      )}
      {showMoveToInProgressCourseSuccess && (
        <CourseEnrollmentsAlert variant="success" onClose={() => setShowMoveToInProgressCourseSuccess(false)}>
          Your course was moved to In Progress.
        </CourseEnrollmentsAlert>
      )}
      {/*
          Only render children if there are no course enrollments or errors.
          This allows the parent component to customize what
          gets displayed if the user does not have any course enrollments.
      */}
      {!hasCourseEnrollments && children}
      <>
        <CourseSection
          title={COURSE_SECTION_TITLES.current}
          courseRuns={currentCourseEnrollments}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.completed}
          courseRuns={completedCourseEnrollments}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.savedForLater}
          courseRuns={savedForLaterCourseEnrollments}
        />
      </>
    </>
  );
}

CourseEnrollments.propTypes = {
  children: PropTypes.node,
};

CourseEnrollments.defaultProps = {
  children: null,
};

export default CourseEnrollments;
