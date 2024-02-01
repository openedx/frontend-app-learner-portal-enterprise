import { ASSIGNMENT_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

/**
 * Determines whether there are any unacknowledged expired assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged expired assignments, otherwise false.
 */
export function getHasUnacknowledgedExpiredAssignments(assignments) {
  return assignments.some((assignment) => (
    assignment.state === ASSIGNMENT_TYPES.EXPIRED && !assignment.learnerAcknowledged
  ));
}

/**
 * Determines whether there are any unacknowledged canceled assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged canceled assignments, otherwise false.
 */
export function getHasUnacknowledgedCanceledAssignments(assignments) {
  return assignments.some((assignment) => (
    assignment.state === ASSIGNMENT_TYPES.CANCELED && !assignment.learnerAcknowledged
  ));
}
