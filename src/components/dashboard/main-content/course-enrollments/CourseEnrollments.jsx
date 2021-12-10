import React, { useContext } from 'react';
import MediaQuery from 'react-responsive';
import { breakpoints, Row } from '@edx/paragon';

import PropTypes from 'prop-types';
import { LoadingSpinner } from '../../../loading-spinner';
import CourseSection from './CourseSection';
import { Sidebar } from '../../../layout';
import { DashboardSidebar } from '../../sidebar';
import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
  SavedForLaterCourseCard,
} from './course-cards';

import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import { CourseEnrollmentsContext } from './CourseEnrollmentsContextProvider';

export const COURSE_SECTION_TITLES = {
  inProgress: 'My courses in progress',
  upcoming: 'Upcoming courses',
  completed: 'Completed courses',
  savedForLater: 'Courses saved for later',
};

const CourseEnrollments = ({ children }) => {
  const {
    courseEnrollmentsByStatus,
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
  } = useContext(CourseEnrollmentsContext);

  const hasCourseEnrollments = Object.values(courseEnrollmentsByStatus).flat().length > 0;
  const isLoading = Object.keys(courseEnrollmentsByStatus).length === 0;

  if (isLoading) {
    return <LoadingSpinner screenReaderText="loading course enrollments" />;
  }

  if (fetchCourseEnrollmentsError) {
    return (
      <CourseEnrollmentsAlert variant="danger">
        An error occurred while retrieving your course enrollments. Please try again.
      </CourseEnrollmentsAlert>
    );
  }

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
          title={COURSE_SECTION_TITLES.inProgress}
          component={InProgressCourseCard}
          courseRuns={courseEnrollmentsByStatus.inProgress}
        />
        <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
          {matches => matches && (
            <Row>
              <Sidebar data-testid="sidebar">
                <DashboardSidebar />
              </Sidebar>
            </Row>
          )}
        </MediaQuery>
        <CourseSection
          title={COURSE_SECTION_TITLES.upcoming}
          component={UpcomingCourseCard}
          courseRuns={courseEnrollmentsByStatus.upcoming}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.completed}
          component={CompletedCourseCard}
          courseRuns={courseEnrollmentsByStatus.completed}
        />
        <CourseSection
          title={COURSE_SECTION_TITLES.savedForLater}
          component={SavedForLaterCourseCard}
          courseRuns={courseEnrollmentsByStatus.savedForLater}
        />
      </>
    </>
  );
};

CourseEnrollments.propTypes = {
  children: PropTypes.node,
};

CourseEnrollments.defaultProps = {
  children: null,
};

export default CourseEnrollments;
