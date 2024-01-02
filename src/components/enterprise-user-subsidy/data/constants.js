export const LICENSE_STATUS = {
  ACTIVATED: 'activated',
  ASSIGNED: 'assigned',
  REVOKED: 'revoked',
};

export const LOADING_SCREEN_READER_TEXT = 'loading your edX benefits from your organization';

export const enterpriseUserSubsidyQueryKeys = {
  // Namespace for all user subsidy query keys
  all: ['user-subsidy'],
  policy: () => [
    ...enterpriseUserSubsidyQueryKeys.all,
    'policy',
  ],
  // Used with query against `can-redeem` API endpoint
  coursePolicyRedeemability: ({
    enterpriseId, lmsUserId, courseRunKeys, activeCourseRunKey,
  }) => [
    ...enterpriseUserSubsidyQueryKeys.policy(),
    enterpriseId,
    'can-redeem',
    { lmsUserId, courseRunKeys, activeCourseRunKey },
  ],
  // Used with query to fetch user's redeemable subsidy access policies
  redeemablePolicies: (enterpriseId, userId) => [
    ...enterpriseUserSubsidyQueryKeys.policy(),
    'redeemable-policies',
    enterpriseId,
    userId],
  // Used with query for polling pending policy transactions after initial policy redemption
  pollPendingPolicyTransaction: (transaction) => [
    ...enterpriseUserSubsidyQueryKeys.policy(),
    'transactions',
    transaction,
  ],
};

// Mock constants for testing
export const emptyRedeemableLearnerCreditPolicies = {
  redeemablePolicies: [],
  learnerContentAssignments: {
    assignments: [],
    hasAssignments: false,
    allocatedAssignments: [],
    hasAllocatedAssignments: false,
    canceledAssignments: [],
    hasCanceledAssignments: false,
    acceptedAssignments: [],
    hasAcceptedAssignments: false,
    erroredAssignments: [],
    hasErroredAssignments: false,
    assignmentsForDisplay: [],
    hasAssignmentsForDisplay: false,
  },
};
