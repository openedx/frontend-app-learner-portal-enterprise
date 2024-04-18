import { BUDGET_STATUSES } from './constants';

/**
 * Determines whether there are any unacknowledged assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged assignments, otherwise false.
 */
export function getHasUnacknowledgedAssignments(assignments) {
  return assignments.some((assignment) => !assignment.learnerAcknowledged);
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
