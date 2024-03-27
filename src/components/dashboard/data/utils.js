/**
 * Determines whether there are any unacknowledged assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged assignments, otherwise false.
 */
export function getHasUnacknowledgedAssignments(assignments) {
  return assignments.some((assignment) => !assignment.learnerAcknowledged);
}
