import { ASSIGNMENT_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

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
    ASSIGNMENT_TYPES.CANCELLED, ASSIGNMENT_TYPES.ALLOCATED,
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
