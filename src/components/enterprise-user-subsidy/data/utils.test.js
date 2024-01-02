import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../enterprise-offers/data/constants';
import { LICENSE_STATUS, emptyRedeemableLearnerCreditPolicies } from './constants';
import { determineLearnerHasContentAssignmentsOnly, transformRedeemablePoliciesData } from './utils';

describe('transformRedeemablePoliciesData', () => {
  test('transforms policies data by attaching subsidy expiration date to assignments', () => {
    const mockPolicies = [
      {
        subsidy_expiration_date: '2024-03-15T18:48:26Z',
        learner_content_assignments: [
          { assignmentId: 1 },
          { assignmentId: 2 },
        ],
      },
      {
        subsidy_expiration_date: '2023-12-31T23:59:59Z',
        learner_content_assignments: [
          { assignmentId: 3 },
        ],
      },
    ];

    const expectedTransformedData = [
      {
        subsidy_expiration_date: '2024-03-15T18:48:26Z',
        learner_content_assignments: [
          { assignmentId: 1, subsidy_expiration_date: '2024-03-15T18:48:26Z' },
          { assignmentId: 2, subsidy_expiration_date: '2024-03-15T18:48:26Z' },
        ],
      },
      {
        subsidy_expiration_date: '2023-12-31T23:59:59Z',
        learner_content_assignments: [
          { assignmentId: 3, subsidy_expiration_date: '2023-12-31T23:59:59Z' },
        ],
      },
    ];

    const transformedData = transformRedeemablePoliciesData(mockPolicies);
    expect(transformedData).toEqual(expectedTransformedData);
  });
});

describe('determineLearnerHasContentAssignmentsOnly', () => {
  test.each([
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has another auto-applied redeemable policy
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
          {
            policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has current enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: true,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has active subscription plan (without activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: true,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has inactive subscription plan (with activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has active subscription plan (with activated license)
     * - Has no subscription license requests
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: true,
      },
      subscriptionLicense: { status: LICENSE_STATUS.ACTIVATED },
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has subscription license request(s)
     * - Has no coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [{ id: 1 }],
      couponCodesCount: 0,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has available coupon codes
     * - Has no coupon code requests
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 1,
      couponCodeRequests: [],
    },
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has assignable redeemable policy with allocated assignment
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has no coupon codes
     * - Has coupon code request(s)
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          allocatedAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAllocatedAssignments: true,
          assignmentsForDisplay: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignmentsForDisplay: true,
        },
      },
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [{ id: 1 }],
    },
  ])('determines whether learner only has assignments available, i.e. no other subsidies (%s)', ({
    isAssignmentLearnerOnly,
    redeemableLearnerCreditPolicies,
    hasCurrentEnterpriseOffers,
    subscriptionPlan,
    subscriptionLicense,
    licenseRequests,
    couponCodesCount,
    couponCodeRequests,
  }) => {
    const actualResult = determineLearnerHasContentAssignmentsOnly({
      subscriptionPlan,
      subscriptionLicense,
      licenseRequests,
      couponCodesCount,
      couponCodeRequests,
      redeemableLearnerCreditPolicies,
      hasCurrentEnterpriseOffers,
    });
    expect(actualResult).toEqual(isAssignmentLearnerOnly);
  });
});
