import { ASSIGNMENT_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

/**
 * Takes the flattened array from redeemableLearnerCreditPolicies and returns the options of
 * the array of filteredActiveAssignments, along with a method to return the boolean value
 * @param assignments - flatMap'ed object from redeemableLearnerCreditPolicies for learnerContentAssignments
 * @returns {{isActiveAssignments: (function(): boolean), filteredActiveAssignments: *}}
 */
export default function getActiveAssignments(assignments) {
  const filteredActiveAssignments = assignments?.filter((assignment) => assignment?.state === ASSIGNMENT_TYPES.ALLOCATED
      || assignment?.state === ASSIGNMENT_TYPES.CANCELLED);
  const isActiveAssignments = () => filteredActiveAssignments.length > 0;
  return {
    filteredActiveAssignments,
    isActiveAssignments,
  };
}
