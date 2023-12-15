import { ASSIGNMENT_TYPES, ASSIGNMENT_ACTION_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT,
} from '../main-content/course-enrollments/data/constants';

export function getIsActiveExpiredAssignment(assignments) {
  const lastExpiredAlertDismissedTime = global.localStorage.getItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT);

  const activeExpiredAssignments = assignments.filter((assignment) => (
    assignment?.actions.some((action) => (
      action.actionType === ASSIGNMENT_ACTION_TYPES.AUTOMATIC_CANCELLATION_NOTIFICATION
      && new Date(action.completedAt) > new Date(lastExpiredAlertDismissedTime)
    ))
  ));
  return activeExpiredAssignments.length > 0;
}

export function getIsActiveCancelledAssignment(assignments) {
  const lastCancelledAlertDismissedTime = global.localStorage.getItem(
    LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  );
  const activeCancelledAssignments = assignments.filter((assignment) => (
    assignment?.actions.some((action) => (
      action.actionType === ASSIGNMENT_ACTION_TYPES.CANCELLED_NOTIFICATION
      && new Date(action.completedAt) > new Date(lastCancelledAlertDismissedTime)
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
export default function getActiveAssignments(assignments = []) {
  const activeAssignments = assignments.filter((assignment) => [
    ASSIGNMENT_TYPES.ALLOCATED,
  ].includes(assignment.state));
  const hasAssignments = assignments.length > 0;
  const hasActiveAssignments = activeAssignments.length > 0;
  return {
    assignments,
    hasAssignments,
    activeAssignments,
    hasActiveAssignments,
  };
}
