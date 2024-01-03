import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import CourseSection from './CourseSection';
import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import CourseAssignmentAlert from './CourseAssignmentAlert';
import { CourseEnrollmentsContext } from './CourseEnrollmentsContextProvider';
import { features } from '../../../../config';
import { useCourseEnrollmentsBySection, useContentAssignments } from './data';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';

export const COURSE_SECTION_TITLES = {
  current: 'My courses',
  completed: 'Completed courses',
  savedForLater: 'Saved for later',
  assigned: 'Assigned Courses',
};

const CourseEnrollments = ({ children }) => {
  const { redeemableLearnerCreditPolicies } = useContext(UserSubsidyContext);
  const {
    fetchCourseEnrollmentsError,
    showMarkCourseCompleteSuccess,
    showMoveToInProgressCourseSuccess,
    setShowMarkCourseCompleteSuccess,
    setShowMoveToInProgressCourseSuccess,
    courseEnrollmentsByStatus,
  } = useContext(CourseEnrollmentsContext);
  const {
    assignments,
    showCanceledAssignmentsAlert,
    showExpiredAssignmentsAlert,
    handleOnCloseCancelAlert,
    handleOnCloseExpiredAlert,
  } = useContentAssignments(redeemableLearnerCreditPolicies);
  const {
    hasCourseEnrollments,
    currentCourseEnrollments,
    completedCourseEnrollments,
    savedForLaterCourseEnrollments,
  } = useCourseEnrollmentsBySection({
    courseEnrollmentsByStatus,
    assignments,
  });

  if (fetchCourseEnrollmentsError) {
    return (
      <CourseEnrollmentsAlert variant="danger">
        An error occurred while retrieving your course enrollments. Please try again.
      </CourseEnrollmentsAlert>
    );
  }

  return (
    <>
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <CourseAssignmentAlert showAlert={showCanceledAssignmentsAlert} variant="canceled" onClose={handleOnCloseCancelAlert}> </CourseAssignmentAlert>
      )}
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <CourseAssignmentAlert showAlert={showExpiredAssignmentsAlert} variant="expired" onClose={handleOnCloseExpiredAlert}> </CourseAssignmentAlert>
      )}
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
      {(!hasCourseEnrollments && !(features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && assignments.length > 0)) && children}
      <>
        {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
          <CourseSection
            title={COURSE_SECTION_TITLES.assigned}
            courseRuns={assignments}
          />
        )}
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
};

CourseEnrollments.propTypes = {
  children: PropTypes.node,
};

CourseEnrollments.defaultProps = {
  children: null,
};

export default CourseEnrollments;
