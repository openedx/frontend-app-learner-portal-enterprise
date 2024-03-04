import React, {
  useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import CourseSection from './CourseSection';
import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import CourseAssignmentAlert from './CourseAssignmentAlert';
import { CourseEnrollmentsContext } from './CourseEnrollmentsContextProvider';
import { features } from '../../../../config';
import { useCourseEnrollmentsBySection, useContentAssignments } from './data';
import { UserSubsidyContext } from '../../../enterprise-user-subsidy';
import { ASSIGNMENT_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';

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
    handleAcknowledgeAssignments,
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
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    const cookies = new Cookies();
    const hasUserVisitedDashboard = cookies.get('has-user-seen-enrollments');
    if (!hasUserVisitedDashboard) {
      cookies.set('has-user-seen-enrollments', true, { path: '/' });
      setIsFirstVisit(true);
    }
  }, []);

  if (fetchCourseEnrollmentsError) {
    return (
      <CourseEnrollmentsAlert variant="danger">
        <FormattedMessage
          id="enterprise.dashboard.course.enrollments.error"
          defaultMessage="An error occurred while retrieving your course enrollments. Please try again."
          description="Error message when an error occurs while retrieving course enrollments."
        />
      </CourseEnrollmentsAlert>
    );
  }

  return (
    <>
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <CourseAssignmentAlert
          showAlert={showCanceledAssignmentsAlert}
          variant={ASSIGNMENT_TYPES.CANCELED}
          onClose={() => handleAcknowledgeAssignments({
            assignmentState: ASSIGNMENT_TYPES.CANCELED,
          })}
        />
      )}
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <CourseAssignmentAlert
          showAlert={showExpiredAssignmentsAlert}
          variant={ASSIGNMENT_TYPES.EXPIRED}
          onClose={() => handleAcknowledgeAssignments({
            assignmentState: ASSIGNMENT_TYPES.EXPIRED,
          })}
        />
      )}
      {showMarkCourseCompleteSuccess && (
        <CourseEnrollmentsAlert variant="success" onClose={() => setShowMarkCourseCompleteSuccess(false)}>
          <FormattedMessage
            id="enterprise.dashboard.course.enrollment.saved.for.later.alert.text"
            defaultMessage="Your course was saved for later."
            description="Message when a course is saved for later."
          />
        </CourseEnrollmentsAlert>
      )}
      {showMoveToInProgressCourseSuccess && (
        <CourseEnrollmentsAlert variant="success" onClose={() => setShowMoveToInProgressCourseSuccess(false)}>
          <FormattedMessage
            id="enterprise.dashboard.course.enrollment.moved.to.progress.alert.text"
            defaultMessage="Your course was moved to In Progress."
            description="Message when a course is moved to In Progress."
          />
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
            title={isFirstVisit ? intl.formatMessage({
              id: 'enterprise.dashboard.course.enrollments.assigned.section.title.for.first.visit',
              defaultMessage: 'Your learning journey starts now!',
              description: 'Title for the assigned courses section when the user visits the dashboard for the first time.',
            }) : intl.formatMessage({
              id: 'enterprise.dashboard.course.enrollments.assigned.section.title',
              defaultMessage: 'Assigned Courses',
              description: 'Title for the assigned courses section.',
            })}
            courseRuns={assignments}
          />
        )}
        <CourseSection
          title={intl.formatMessage({
            id: 'enterprise.dashboard.course.enrollments.my.courses.section.title',
            defaultMessage: 'My courses',
            description: 'Title for the my courses section.',
          })}
          courseRuns={currentCourseEnrollments}
        />
        <CourseSection
          title={intl.formatMessage({
            id: 'enterprise.dashboard.course.enrollments.completed.courses.section.title',
            defaultMessage: 'Completed courses',
            description: 'Title for the completed courses section.',
          })}
          courseRuns={completedCourseEnrollments}
        />
        <CourseSection
          title={intl.formatMessage({
            id: 'enterprise.dashboard.course.enrollments.save.for.later.courses.section.title',
            defaultMessage: 'Saved for later',
            description: 'Title for the saved for later courses section.',
          })}
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
