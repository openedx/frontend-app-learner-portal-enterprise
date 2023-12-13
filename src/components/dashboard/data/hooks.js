import { useEffect, useState } from 'react';
import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

export default function useActiveAssignments(redeemableLearnerCreditPolicy) {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignments, setActiveAssignment] = useState([]);
  const [hasActiveAssignments, setHasActiveAssignments] = useState(false);

  useEffect(() => {
    if (redeemableLearnerCreditPolicy) {
      const allAssignments = redeemableLearnerCreditPolicy
        .filter(policy => policy.policyType === POLICY_TYPES.ASSIGNED_CREDIT)
        .map((policy) => policy.learnerContentAssignments || [])[0];

      const filteredActiveAssignments = assignments.filter((assignment) => [
        ASSIGNMENT_TYPES.CANCELLED, ASSIGNMENT_TYPES.ALLOCATED,
      ].includes(assignment.state));
      setAssignments(allAssignments);
      setActiveAssignment(filteredActiveAssignments);
      setHasActiveAssignments(filteredActiveAssignments.length > 0);
    }
  }, [assignments, redeemableLearnerCreditPolicy]);

  return {
    assignments,
    activeAssignments,
    hasActiveAssignments,
  };
}
