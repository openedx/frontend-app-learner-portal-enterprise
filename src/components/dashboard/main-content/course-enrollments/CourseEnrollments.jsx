import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import { v4 as uuidv4 } from 'uuid';
import camelCase from 'lodash.camelcase';
import CourseSection from './CourseSection';
import CourseAssignmentAlert from './CourseAssignmentAlert';
import { features } from '../../../../config';
import { useContentAssignments, useCourseEnrollmentsBySection, useGroupAssociationsAlert } from './data';
import { ASSIGNMENT_TYPES, useEnterpriseCourseEnrollments, useEnterpriseFeatures } from '../../../app/data';
import CourseEnrollmentsAlert from './CourseEnrollmentsAlert';
import NewGroupAssignmentAlert from './NewGroupAssignmentAlert';
import CourseEnrollmentsContext from './CourseEnrollmentsContext';

const messages = defineMessages({
  inProgress: {
    id: 'enterprise.dashboard.course.enrollment.moved.to.in.progress.alert.text',
    defaultMessage: 'Your course was moved to "In Progress".',
    description: 'Message when a course is moved to in progress.',
  },
  savedForLater: {
    id: 'enterprise.dashboard.course.enrollment.saved.for.later.alert.text',
    defaultMessage: 'Your course was saved for later.',
    description: 'Message when a course is saved for later.',
  },
});

/**
 * Checks if the user has visited the dashboard before, determined by the presence of
 * localStorage set by the `dashboardLoader`.
 *
 * @returns {boolean} - Whether the user has visited the dashboard before.
 */
function useIsFirstDashboardVisit() {
  const hasUserVisited = localStorage.getItem('has-user-visited-learner-dashboard');
  return !hasUserVisited;
}

function useEnrollmentStatusChangeAlerts() {
  const intl = useIntl();
  const [courseEnrollmentStatusChanges, setCourseEnrollmentStatusChanges] = useState([]);
  const addCourseEnrollmentStatusChangeAlert = useCallback((type) => {
    const message = intl.formatMessage(messages[camelCase(type)]);
    const uuid = uuidv4();

    const courseEnrollmentChangeAlert = {
      uuid,
      message,
      dismiss: () => {
        setCourseEnrollmentStatusChanges((prevState) => prevState.filter(alert => alert.uuid !== uuid));
      },
    };
    setCourseEnrollmentStatusChanges((prevState) => [...prevState, courseEnrollmentChangeAlert]);
  }, [intl]);

  return useMemo(() => ({
    courseEnrollmentStatusChanges,
    addCourseEnrollmentStatusChangeAlert,
  }), [addCourseEnrollmentStatusChangeAlert, courseEnrollmentStatusChanges]);
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
    showExpiringAssignmentsAlert,
    handleAcknowledgeExpiringAssignments,
    handleAcknowledgeAssignments,
    isAcknowledgingAssignments,
  } = useContentAssignments();

  const isFirstVisit = useIsFirstDashboardVisit();

  const courseEnrollmentsContextValue = useEnrollmentStatusChangeAlerts();

  const {
    showNewGroupAssociationAlert,
    dismissGroupAssociationAlert,
    enterpriseCustomer,
  } = useGroupAssociationsAlert();

  // If there are no enrollments or assignments, render the children. This
  // allows the parent component to customize what gets displayed as empty
  // state if the user does not have any course enrollments or assignments.
  if (!hasCourseEnrollments) {
    return children;
  }

  return (
    <CourseEnrollmentsContext.Provider value={courseEnrollmentsContextValue}>
      {enterpriseFeatures.enterpriseGroupsV1 && (
        <NewGroupAssignmentAlert
          showAlert={showNewGroupAssociationAlert}
          onClose={dismissGroupAssociationAlert}
          enterpriseCustomer={enterpriseCustomer}
        />
      )}
      {courseEnrollmentsContextValue.courseEnrollmentStatusChanges?.map(({ uuid, message, dismiss }) => (
        <CourseEnrollmentsAlert
          key={uuid}
          variant="success"
          onClose={dismiss}
        >
          {message}
        </CourseEnrollmentsAlert>
      ))}
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
          <CourseAssignmentAlert
            showAlert={showExpiringAssignmentsAlert}
            variant={ASSIGNMENT_TYPES.EXPIRING}
            onClose={handleAcknowledgeExpiringAssignments}
          />
          <CourseSection
            title={isFirstVisit ? intl.formatMessage({
              id: 'enterprise.dashboard.course.enrollments.assigned.section.title.for.first.visit',
              defaultMessage: 'Your learning journey starts now!',
              description: 'Title for the assigned courses section when the user visits the dashboard for the first time.',
            }) : intl.formatMessage({
              id: 'enterprise.dashboard.course.enrollments.pending.section.title',
              defaultMessage: 'Pending enrollments',
              description: 'Title for the pending enrollments section.',
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
    </CourseEnrollmentsContext.Provider>
  );
};

CourseEnrollments.propTypes = {
  children: PropTypes.node,
};

CourseEnrollments.defaultProps = {
  children: null,
};

export default CourseEnrollments;
