import { ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY, BUDGET_STATUSES } from './constants';

/**
 * Determines whether there are any unacknowledged assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged assignments, otherwise false.
 */
export function getHasUnacknowledgedAssignments(assignments) {
  return assignments.some((assignment) => !assignment.learnerAcknowledged);
}

export function getExpiringAssignmentsAcknowledgementState(assignments) {
  const alreadyAcknowledgedExpiringAssignments = JSON.parse(
    global.localStorage.getItem(ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY),
  ) || [];

  const expiringAssignments = [];
  const unacknowledgedExpiringAssignments = [];
  const acknowledgedExpiringAssignments = [];

  assignments.forEach((assignment) => {
    if (!assignment.isExpiringAssignment) {
      return;
    }
    expiringAssignments.push(assignment);
    if (alreadyAcknowledgedExpiringAssignments.includes(assignment.uuid)) {
      acknowledgedExpiringAssignments.push(assignment);
    } else {
      unacknowledgedExpiringAssignments.push(assignment);
    }
  });

  return {
    expiringAssignments,
    unacknowledgedExpiringAssignments,
    hasUnacknowledgedExpiringAssignments: unacknowledgedExpiringAssignments.length > 0,
    acknowledgedExpiringAssignments,
    hasAcknowledgedExpiringAssignments: acknowledgedExpiringAssignments.length > 0,
  };
}

//  Utility function to check the budget status
export const getStatusMetadata = ({
  isPlanApproachingExpiry,
  endDateStr,
  currentDate = new Date(),
}) => {
  const endDate = new Date(endDateStr);

  if (isPlanApproachingExpiry) {
    return {
      status: BUDGET_STATUSES.expiring,
      badgeVariant: 'warning',
      term: 'Expiring',
      date: endDateStr,
    };
  }

  // Check if budget is current (today's date between start/end dates)
  if (currentDate <= endDate) {
    return {
      status: BUDGET_STATUSES.active,
      badgeVariant: 'success',
      term: 'Expires',
      date: endDateStr,
    };
  }

  // Otherwise, budget must be expired
  return {
    status: BUDGET_STATUSES.expired,
    badgeVariant: 'light',
    term: 'Expired',
    date: endDateStr,
  };
};
