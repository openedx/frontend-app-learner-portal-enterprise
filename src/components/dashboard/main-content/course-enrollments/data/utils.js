import dayjs from 'dayjs';

/**
 * TODO
 * @param {*} enrollments
 * @returns
 */
export function sortedEnrollmentsByEnrollmentDate(enrollments) {
  enrollments.sort((c1, c2) => dayjs(c1.created) - dayjs(c2.created));
  return enrollments;
}

/**
 * Sorts assignments by their status (canceled or expired).
 * @param {array} assignments - Array of assignments to be sorted.
 * @returns {array} - Returns the sorted array of assignments.
 */
export function sortAssignmentsByAssignmentStatus(assignments) {
  const assignmentsCopy = [...assignments];
  const sortedAssignments = assignmentsCopy.sort((a, b) => {
    const isAssignmentACanceledOrExpired = ['cancelled', 'expired'].includes(a.state) ? 1 : 0;
    const isAssignmentBCanceledOrExpired = ['cancelled', 'expired'].includes(b.state) ? 1 : 0;
    if (isAssignmentACanceledOrExpired && !isAssignmentBCanceledOrExpired) {
      return 1; // a should come after b (expired/canceled assignments come last)
    }
    if (!isAssignmentACanceledOrExpired && isAssignmentBCanceledOrExpired) {
      return -1; // b should come after a (expired/canceled assignments come last)
    }
    // If both assignments are not canceled or expired, sort by enroll-by date in ascending order
    return dayjs(a.enrollBy).diff(dayjs(b.enrollBy));
  });
  return sortedAssignments;
}
