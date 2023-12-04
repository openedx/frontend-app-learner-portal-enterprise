import { ASSIGNMENT_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';

export default function getActiveAssignments(assignments) {
  const filteredAssignments = assignments?.filter((assignment) => assignment?.state === ASSIGNMENT_TYPES.ALLOCATED
      || assignment?.state === ASSIGNMENT_TYPES.CANCELLED);
  const isActiveAssignments = () => filteredAssignments.length > 0;
  return {
    filteredAssignments,
    isActiveAssignments,
  };
}
