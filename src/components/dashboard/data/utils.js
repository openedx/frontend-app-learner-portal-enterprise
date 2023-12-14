import { ASSIGNMENT_TYPES, ASSIGNMENT_ACTION_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT,
} from '../main-content/course-enrollments/data/constants';

export function getIsActiveExpiredAssignment(assignments) {
  const lastExpiredAlertDismissedTime = global.localStorage.getItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT);

  const activeExpiredAssignments = assignments.filter((assignment) => (
    assignment?.actions.some((action) => (
      action.actionType === ASSIGNMENT_ACTION_TYPES.CANCELLED
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
      action.actionType === ASSIGNMENT_ACTION_TYPES.CANCELLED
      && new Date(action.completedAt) > new Date(lastCancelledAlertDismissedTime)
    ))
  ));
  return activeCancelledAssignments.length > 0;
}

/**
 * Takes the flattened array from redeemableLearnerCreditPolicies and returns the options of
 * the array of activeAssignments, or hasActiveAssignments which returns a boolean value
 * @param assignments - flatMap'ed object from redeemableLearnerCreditPolicies for learnerContentAssignments
 * @returns {{hasActiveAssignments: boolean, activeAssignments: Array}}
 */
export default function getActiveAssignments(assignments = []) {
  const activeAssignments = assignments.filter((assignment) => [
    ASSIGNMENT_TYPES.ALLOCATED,
  ].includes(assignment.state));
  const hasActiveAssignments = activeAssignments.length > 0;
  return {
    activeAssignments,
    hasActiveAssignments,
  };
}
