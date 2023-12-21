import dayjs from 'dayjs';
import { ASSIGNMENT_TYPES, ASSIGNMENT_ACTION_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT,
} from '../main-content/course-enrollments/data/constants';

/**
 * Checks if an assignment has expired based on following conditions:
 * - 90 days have passed since the "created" date.
 * - The course enrollment deadline has passed.
 * - The subsidy expiration date has passed.
 * @param {object} assignment - Information about the assignment.
 * @returns {boolean} - Returns true if the assignment has expired, otherwise false.
 */
export const isAssignmentExpired = (assignment) => {
  if (!assignment) {
    return {
      isExpired: false,
      enrollByDeadline: undefined,
    };
  }

  const currentDate = dayjs();
  // Note: `created` is not currently present in the API response for assignments. In the future,
  // the enroll by deadline will be returned by API instead of calculating it here.
  const allocationDate = assignment.created ? dayjs(assignment.created) : undefined;
  const enrollmentEndDate = assignment.contentMetadata.enrollByDate
    ? dayjs(assignment.contentMetadata.enrollByDate)
    : undefined;
  const subsidyExpirationDate = dayjs(assignment.subsidyExpirationDate);

  const hasExceededAssignmentDeadline = allocationDate && currentDate.diff(allocationDate, 'day') > 90;
  const isEnrollmentDeadlineExpired = enrollmentEndDate && currentDate.isAfter(enrollmentEndDate);

  const isExpired = (
    hasExceededAssignmentDeadline || isEnrollmentDeadlineExpired || currentDate.isAfter(subsidyExpirationDate)
  );

  const assignmentExpiryDates = [enrollmentEndDate, subsidyExpirationDate];
  if (allocationDate) {
    assignmentExpiryDates.push(dayjs(allocationDate).add(90, 'day'));
  }
  const earliestAssignmentExpiryDate = assignmentExpiryDates.sort()[0]?.toDate();

  return {
    isExpired,
    enrollByDeadline: earliestAssignmentExpiryDate,
  };
};

/**
 * Determines whether an assignment record is expired and/or the expiration has been acknowledged by the learner.
 *
 * @param {Object} assignment - Metadata about the assignment.
 * @returns {Object} - Returns an object with the following properties:
 * - isExpired: Boolean indicating whether the assignment has expired.
 * - hasDismissedExpiration: Boolean indicating whether the learner has acknowledged the assignment expiration.
 */
export function isExpiredAssignmentAcknowledged(assignment) {
  const lastExpiredAlertDismissedTime = global.localStorage.getItem(
    LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT,
  );
  const { isExpired, enrollByDeadline } = isAssignmentExpired(assignment);
  const isAcknowledged = dayjs(enrollByDeadline).isBefore(new Date(lastExpiredAlertDismissedTime));
  const hasDismissedExpiration = isExpired && isAcknowledged;
  return {
    isExpired,
    hasDismissedExpiration,
  };
}

/**
 * Determines whether there are any unacknowledged expired assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged expired assignments, otherwise false.
 */
export function getHasUnacknowledgedExpiredAssignments(assignments) {
  return assignments.some((assignment) => {
    const { isExpired, hasDismissedExpiration } = isExpiredAssignmentAcknowledged(assignment);
    return isExpired && !hasDismissedExpiration;
  });
}

/**
 * Determines whether an assignment has been canceled and/or the cancelaton has been acknowledged by the learner.
 *
 * @param {Object} assignment - Metadata about the assignment.
 * @returns {Object} - Returns an object with the following properties:
 * - isCanceled: Boolean indicating whether the assignment has been canceled.
 * - hasDismissedCancellation: Boolean indicating whether the learner has acknowledged the assignment cancellation.
 */
export function isCanceledAssignmentAcknowledged(assignment) {
  const lastCanceledAlertDismissedTime = global.localStorage.getItem(
    LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT,
  );
  const isCanceled = assignment.state === ASSIGNMENT_TYPES.CANCELED;
  const hasDismissedCancelation = assignment.actions.some((action) => {
    const isCanceledNoticationAction = [
      ASSIGNMENT_ACTION_TYPES.CANCELED,
      ASSIGNMENT_ACTION_TYPES.AUTOMATIC_CANCELATION,
    ].includes(action.actionType);
    const isAcknowledged = dayjs(action.completedAt).isBefore(new Date(lastCanceledAlertDismissedTime));
    return isCanceled && isCanceledNoticationAction && isAcknowledged;
  });
  return {
    isCanceled,
    hasDismissedCancelation,
  };
}

/**
 * Determines whether there are any unacknowledged canceled assignments.
 *
 * @param {Array} assignments - Metadata about the assignments.
 * @returns {Boolean} - Returns true if there are any unacknowledged canceled assignments, otherwise false.
 */
export function getHasUnacknowledgedCanceledAssignments(assignments) {
  return assignments.some((assignment) => {
    const { isCanceled, hasDismissedCancelation } = isCanceledAssignmentAcknowledged(assignment);
    return isCanceled && !hasDismissedCancelation;
  });
}

/**
 * Takes a flattened array of assignments and returns an object containing
 * lists of assignments for each assignment state.
 *
 * @param {Array} assignments - List of content assignments.
 * @returns {{
 *  assignments: Array,
 *  hasAssignments: Boolean,
 *  allocatedAssignments: Array,
 *  hasAllocatedAssignments: Boolean,
 *  canceledAssignments: Array,
 *  hasCanceledAssignments: Boolean,
 *  acceptedAssignments: Array,
 *  hasAcceptedAssignments: Boolean,
 * }}
 */
export function getAssignmentsByState(assignments = []) {
  const allAssignments = [];
  const allocatedAssignments = [];
  const canceledAssignments = [];
  const acceptedAssignments = [];
  const erroredAssignments = [];

  assignments.forEach((assignment) => {
    allAssignments.push(assignment);
    if (assignment.state === ASSIGNMENT_TYPES.ALLOCATED) {
      allocatedAssignments.push(assignment);
    }
    if (assignment.state === ASSIGNMENT_TYPES.CANCELED) {
      canceledAssignments.push(assignment);
    }
    if (assignment.state === ASSIGNMENT_TYPES.ACCEPTED) {
      acceptedAssignments.push(assignment);
    }
    if (assignment.state === ASSIGNMENT_TYPES.ERRORED) {
      erroredAssignments.push(assignment);
    }
  });

  const hasAssignments = allAssignments.length > 0;
  const hasAllocatedAssignments = allocatedAssignments.length > 0;
  const hasCanceledAssignments = canceledAssignments.length > 0;
  const hasAcceptedAssignments = acceptedAssignments.length > 0;
  const hasErroredAssignments = erroredAssignments.length > 0;

  return {
    assignments,
    hasAssignments,
    allocatedAssignments,
    hasAllocatedAssignments,
    canceledAssignments,
    hasCanceledAssignments,
    acceptedAssignments,
    hasAcceptedAssignments,
    erroredAssignments,
    hasErroredAssignments,
  };
}
