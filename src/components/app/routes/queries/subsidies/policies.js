import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';

import { ASSIGNMENT_TYPES } from '../../../../enterprise-user-subsidy/enterprise-offers/data/constants';

/**
 * Transforms the redeemable policies data by attaching the subsidy expiration date
 * to each assignment within the policies, if available.
 *
 * [TODO: tech debt] This function could likely be removed if the `credits_available` API endpoint
 * itself serialized the `learnerContentAssignments` with the `subsidyExpirationDate` included.
 *
 * @param {object[]} [policies] - Array of policy objects containing learner assignments.
 * @returns {object} - Returns modified policies data with subsidy expiration dates attached to assignments.
 */
const transformRedeemablePoliciesData = (policies = []) => policies.map((policy) => {
  const assignmentsWithSubsidyExpiration = policy.learnerContentAssignments.map(assignment => ({
    ...assignment,
    subsidyExpirationDate: policy.subsidyExpirationDate,
  }));
  return {
    ...policy,
    learnerContentAssignments: assignmentsWithSubsidyExpiration,
  };
});

/**
 * TODO
 * @param {*} assignments
 * @returns
 */
function getAssignmentsByState(assignments = []) {
  const allocatedAssignments = [];
  const acceptedAssignments = [];
  const canceledAssignments = [];
  const expiredAssignments = [];
  const erroredAssignments = [];
  const assignmentsForDisplay = [];

  assignments.forEach((assignment) => {
    switch (assignment.state) {
      case ASSIGNMENT_TYPES.ALLOCATED:
        allocatedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ACCEPTED:
        acceptedAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.CANCELED:
        canceledAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.EXPIRED:
        expiredAssignments.push(assignment);
        break;
      case ASSIGNMENT_TYPES.ERRORED:
        erroredAssignments.push(assignment);
        break;
      default:
        logError(`[getAssignmentsByState] Unsupported state ${assignment.state} for assignment ${assignment.uuid}`);
        break;
    }
  });

  const hasAssignments = assignments.length > 0;
  const hasAllocatedAssignments = allocatedAssignments.length > 0;
  const hasAcceptedAssignments = acceptedAssignments.length > 0;
  const hasCanceledAssignments = canceledAssignments.length > 0;
  const hasExpiredAssignments = expiredAssignments.length > 0;
  const hasErroredAssignments = erroredAssignments.length > 0;

  // Concatenate all assignments for display (includes allocated and canceled assignments)
  assignmentsForDisplay.push(...allocatedAssignments);
  assignmentsForDisplay.push(...canceledAssignments);
  assignmentsForDisplay.push(...expiredAssignments);
  const hasAssignmentsForDisplay = assignmentsForDisplay.length > 0;

  return {
    assignments,
    hasAssignments,
    allocatedAssignments,
    hasAllocatedAssignments,
    acceptedAssignments,
    hasAcceptedAssignments,
    canceledAssignments,
    hasCanceledAssignments,
    expiredAssignments,
    hasExpiredAssignments,
    erroredAssignments,
    hasErroredAssignments,
    assignmentsForDisplay,
    hasAssignmentsForDisplay,
  };
}

/**
 * TODO
 * @param {*} enterpriseUUID
 * @param {*} userID
 * @returns
 */
async function fetchRedeemablePolicies(enterpriseUUID, userID) {
  const queryParams = new URLSearchParams({
    enterprise_customer_uuid: enterpriseUUID,
    lms_user_id: userID,
  });
  const config = getConfig();
  const url = `${config.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/credits_available/?${queryParams.toString()}`;
  const response = await getAuthenticatedHttpClient().get(url);
  const data = camelCaseObject(response.data);
  const redeemablePolicies = transformRedeemablePoliciesData(data);
  const learnerContentAssignments = getAssignmentsByState(
    redeemablePolicies?.flatMap(item => item.learnerContentAssignments || []),
  );
  return {
    redeemablePolicies,
    learnerContentAssignments,
  };
}

/**
 * TODO
 * @param {*} param0
 * @returns
 */
export function makeRedeemablePoliciesQuery({ enterpriseUuid, lmsUserId }) {
  return {
    queryKey: ['enterprise', 'redeemable-policies', enterpriseUuid, lmsUserId],
    queryFn: async () => fetchRedeemablePolicies(enterpriseUuid, lmsUserId),
    enabled: !!enterpriseUuid,
  };
}
