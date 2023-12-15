import dayjs from 'dayjs';
import { ASSIGNMENT_TYPES, ASSIGNMENT_ACTION_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { isAssignmentExpired } from '../main-content/course-enrollments/data';
import {
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT,
} from '../main-content/course-enrollments/data/constants';

export function getHasActiveExpiredAssignment(assignments) {
  const lastExpiredAlertDismissedTime = global.localStorage.getItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT);

  const activeExpiredAssignments = assignments.filter((assignment) => {
    const {
      isExpired,
      enrollByDeadline,
    } = isAssignmentExpired(assignment);

    if (!isExpired) {
      return false;
    }

    return dayjs(enrollByDeadline).isAfter(new Date(lastExpiredAlertDismissedTime));
  });

  return activeExpiredAssignments.length > 0;
}

export function getHasActiveCancelledAssignments(assignments) {
  const lastCancelledAlertDismissedTime = global.localStorage.getItem(
    LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  );

  const activeCancelledAssignments = assignments.filter((assignment) => (
    assignment.actions.some((action) => (
      action.actionType === ASSIGNMENT_ACTION_TYPES.CANCELLED_NOTIFICATION
      && dayjs(action.completedAt).isAfter(new Date(lastCancelledAlertDismissedTime))
    ))
  ));
  return activeCancelledAssignments.length > 0;
}

/**
 * Takes a flattened array of assignments and returns an object containing:
 * - List of assignments
 * - Boolean hasAssignments
 * - List of active assignments
 * - Boolean hasActiveAssignments
 *
 * @param {Array} assignments - List of content assignments.
 * @returns {{
 *  assignments: Array,
 *  hasAssignments: Boolean,
 *  hasActiveAssignments: Boolean,
 *  activeAssignments: Array,
 * }}
 */
export function getAssignmentsByState(assignments = []) {
  const allAssignments = [];
  const allocatedAssignments = [];
  const canceledAssignments = [];
  const acceptedAssignments = [];

  assignments.forEach((assignment) => {
    allAssignments.push(assignment);
    if (assignment.state === ASSIGNMENT_TYPES.ALLOCATED) {
      allocatedAssignments.push(assignment);
    }
    if (assignment.state === ASSIGNMENT_TYPES.CANCELLED) {
      canceledAssignments.push(assignment);
    }
    if (assignment.state === ASSIGNMENT_TYPES.ACCEPTED) {
      acceptedAssignments.push(assignment);
    }
  });

  const hasAssignments = allAssignments.length > 0;
  const hasAllocatedAssignments = allocatedAssignments.length > 0;
  const hasCanceledAssignments = canceledAssignments.length > 0;
  const hasAcceptedAssignments = acceptedAssignments.length > 0;

  return {
    assignments,
    hasAssignments,
    allocatedAssignments,
    hasAllocatedAssignments,
    canceledAssignments,
    hasCanceledAssignments,
    acceptedAssignments,
    hasAcceptedAssignments,
  };
}
