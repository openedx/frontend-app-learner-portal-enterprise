import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';

import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import CourseSection from './CourseSection';

import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import CourseAssignmentAlert from './CourseAssignmentAlert';
import { CourseEnrollmentsContext } from './CourseEnrollmentsContextProvider';
import {
  getTransformedAllocatedAssignments,
  sortAssignmentsByAssignmentStatus,
  sortedEnrollmentsByEnrollmentDate,
} from './data/utils';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { features } from '../../../../config';
import {
  getHasActiveCancelledAssignments,
  getHasActiveExpiredAssignment,
} from '../../data/utils';
import { ASSIGNMENT_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT, LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT } from './data';

export const COURSE_SECTION_TITLES = {
  current: 'My courses',
  completed: 'Completed courses',
  savedForLater: 'Saved for later',
  assigned: 'Assigned Courses',
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
  const {
    enterpriseConfig: {
      slug,
    },
  } = useContext(AppContext);
  const { redeemableLearnerCreditPolicies } = useContext(UserSubsidyContext);

  const [assignments, setAssignments] = useState([]);
  const [
    showCancelledAssignmentsAlert,
    setShowCancelledAssignmentsAlert,
  ] = useState(false);
  const [showExpiredAssignmentsAlert, setShowExpiredAssignmentsAlert] = useState(false);

  useEffect(() => {
    if (!redeemableLearnerCreditPolicies) {
      return;
    }

    const {
      allocatedAssignments,
      canceledAssignments,
      hasCanceledAssignments,
    } = redeemableLearnerCreditPolicies.learnerContentAssignments;

    const sortedAllocatedAssignments = sortAssignmentsByAssignmentStatus(allocatedAssignments);
    const transformedAllocatedAssignments = getTransformedAllocatedAssignments(
      sortedAllocatedAssignments,
      slug,
    );
    setAssignments(transformedAllocatedAssignments);

    const hasActiveCancelledAssignments = (
      hasCanceledAssignments && getHasActiveCancelledAssignments(canceledAssignments)
    );
    setShowCancelledAssignmentsAlert(hasActiveCancelledAssignments);

    const hasActiveExpiredAssignments = getHasActiveExpiredAssignment(allocatedAssignments);
    setShowExpiredAssignmentsAlert(hasActiveExpiredAssignments);
  }, [redeemableLearnerCreditPolicies, slug]);

  const currentCourseEnrollments = useMemo(
    () => {
      Object.keys(courseEnrollmentsByStatus).forEach((status) => {
        courseEnrollmentsByStatus[status] = courseEnrollmentsByStatus[status].map((course) => {
          const isAssigned = assignments?.some(assignment => (assignment?.state === ASSIGNMENT_TYPES.ACCEPTED
            && course.courseRunId.includes(assignment?.contentKey)));
          if (isAssigned) {
            return { ...course, isCourseAssigned: true };
          }
          return course;
        });
      });
      return sortedEnrollmentsByEnrollmentDate(
        [
          ...courseEnrollmentsByStatus.inProgress,
          ...courseEnrollmentsByStatus.upcoming,
          ...courseEnrollmentsByStatus.requested,
        ],
      );
    },
    [
      assignments,
      courseEnrollmentsByStatus,
    ],
  );

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
  const handleOnCloseCancelAlert = () => {
    setShowCancelledAssignmentsAlert(false);
    global.localStorage.setItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT, new Date());
  };

  const handleOnCloseExpiredAlert = () => {
    setShowCancelledAssignmentsAlert(false);
    global.localStorage.setItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT, new Date());
  };

  const hasCourseEnrollments = Object.values(courseEnrollmentsByStatus).flat().length > 0;
  return (
    <>
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <CourseAssignmentAlert showAlert={showCancelledAssignmentsAlert} variant="cancelled" onClose={handleOnCloseCancelAlert}> </CourseAssignmentAlert>
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
