import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { useLocation } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import CourseSection from './CourseSection';
import CourseAssignmentAlert from './CourseAssignmentAlert';
import { features } from '../../../../config';
import { useCourseEnrollmentsBySection, useContentAssignments, useGroupMembershipAssignments } from './data';
import { ASSIGNMENT_TYPES } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { useEnterpriseCourseEnrollments, useEnterpriseFeatures } from '../../../app/data';
import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import NewGroupAssignmentAlert from './NewGroupAssignmentAlert';

function useIsFirstDashboardVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  useEffect(() => {
    const cookies = new Cookies();
    const hasUserVisitedDashboard = cookies.get('has-user-seen-enrollments');
    if (!hasUserVisitedDashboard) {
      cookies.set('has-user-seen-enrollments', true, { path: '/' });
      setIsFirstVisit(true);
    }
  }, []);
  return isFirstVisit;
}

function useSaveForLaterAlerts() {
  const { state } = useLocation();
  const [shouldShowMarkSavedForLaterCourseSuccess, setShouldShowMarkSavedForLaterCourseSuccess] = useState(false);
  const [shouldShowMoveToInProgressCourseSuccess, setShouldShowMoveToInProgressCourseSuccess] = useState(false);

  useEffect(() => {
    if (state?.markedSavedForLaterSuccess) {
      setShouldShowMarkSavedForLaterCourseSuccess(true);
    } else {
      setShouldShowMarkSavedForLaterCourseSuccess(false);
    }
  }, [state?.markedSavedForLaterSuccess]);

  useEffect(() => {
    if (state?.markedInProgressSuccess) {
      setShouldShowMoveToInProgressCourseSuccess(true);
    } else {
      setShouldShowMoveToInProgressCourseSuccess(false);
    }
  }, [state?.markedInProgressSuccess]);

  return {
    shouldShowMarkSavedForLaterCourseSuccess,
    setShouldShowMarkSavedForLaterCourseSuccess,
    shouldShowMoveToInProgressCourseSuccess,
    setShouldShowMoveToInProgressCourseSuccess,
  };
}

const CourseEnrollments = ({ children }) => {
  const intl = useIntl();
  const {
    data: {
      allEnrollmentsByStatus,
    },
  } = useEnterpriseCourseEnrollments();

  const { data: enterpriseFeatures } = useEnterpriseFeatures();
  const {
    hasCourseEnrollments,
    currentCourseEnrollments,
    completedCourseEnrollments,
    savedForLaterCourseEnrollments,
  } = useCourseEnrollmentsBySection(allEnrollmentsByStatus);

  const {
    assignments,
    showCanceledAssignmentsAlert,
    showExpiredAssignmentsAlert,
    handleAcknowledgeAssignments,
    isAcknowledgingAssignments,
  } = useContentAssignments(allEnrollmentsByStatus.assigned);

  const isFirstVisit = useIsFirstDashboardVisit();

  const {
    shouldShowMarkSavedForLaterCourseSuccess,
    setShouldShowMarkSavedForLaterCourseSuccess,
    shouldShowMoveToInProgressCourseSuccess,
    setShouldShowMoveToInProgressCourseSuccess,
  } = useSaveForLaterAlerts();

  const {
    shouldShowNewGroupMembershipAlert,
    handleAddNewGroupAssignmentToLocalStorage,
    enterpriseCustomer,
  } = useGroupMembershipAssignments();

  // If there are no enrollments or assignments, render the children. This
  // allows the parent component to customize what gets displayed as empty
  // state if the user does not have any course enrollments or assignments.
  if (!hasCourseEnrollments) {
    return children;
  }

  return (
    <>
      {enterpriseFeatures.enterpriseGroupsV1 && (
        <NewGroupAssignmentAlert
          showAlert={shouldShowNewGroupMembershipAlert}
          onClose={() => handleAddNewGroupAssignmentToLocalStorage()}
          enterpriseCustomer={enterpriseCustomer}
        />
      )}
      {features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && (
        <>
          <CourseAssignmentAlert
            showAlert={showCanceledAssignmentsAlert}
            variant={ASSIGNMENT_TYPES.CANCELED}
            onClose={() => handleAcknowledgeAssignments({
              assignmentState: ASSIGNMENT_TYPES.CANCELED,
            })}
            isAcknowledgingAssignments={isAcknowledgingAssignments}
          />
          <CourseAssignmentAlert
            showAlert={showExpiredAssignmentsAlert}
            variant={ASSIGNMENT_TYPES.EXPIRED}
            onClose={() => handleAcknowledgeAssignments({
              assignmentState: ASSIGNMENT_TYPES.EXPIRED,
            })}
            isAcknowledgingAssignments={isAcknowledgingAssignments}
          />
          {shouldShowMarkSavedForLaterCourseSuccess && (
            <CourseEnrollmentsAlert variant="success" onClose={() => setShouldShowMarkSavedForLaterCourseSuccess(false)}>
              <FormattedMessage
                id="enterprise.dashboard.course.enrollment.saved.for.later.alert.text"
                defaultMessage="Your course was saved for later."
                description="Message when a course is saved for later."
              />
            </CourseEnrollmentsAlert>
          )}
          {shouldShowMoveToInProgressCourseSuccess && (
            <CourseEnrollmentsAlert variant="success" onClose={() => setShouldShowMoveToInProgressCourseSuccess(false)}>
              <FormattedMessage
                id="enterprise.dashboard.course.enrollment.moved.to.progress.alert.text"
                defaultMessage="Your course was moved to In Progress."
                description="Message when a course is moved to In Progress."
              />
            </CourseEnrollmentsAlert>
          )}
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
        </>
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
  );
};

CourseEnrollments.propTypes = {
  children: PropTypes.node,
};

CourseEnrollments.defaultProps = {
  children: null,
};

export default CourseEnrollments;
