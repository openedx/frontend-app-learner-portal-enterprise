import { ASSIGNMENT_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

/**
 * Takes the flattened array from redeemableLearnerCreditPolicies and returns the options of
 * the array of activeAssignments, or hasActiveAssignments which returns a boolean value
 * @param assignments - flatMap'ed object from redeemableLearnerCreditPolicies for learnerContentAssignments
 * @returns {{hasActiveAssignments: boolean, activeAssignments: Array}}
 */
export default function getActiveAssignments(assignments = []) {
  const activeAssignments = assignments.filter((assignment) => [
    ASSIGNMENT_TYPES.CANCELLED, ASSIGNMENT_TYPES.ALLOCATED,
  ].includes(assignment.state));
  const hasActiveAssignments = activeAssignments.length > 0;
  return {
    activeAssignments,
    hasActiveAssignments,
  };
}
