import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { ASSIGNMENT_TYPES, POLICY_TYPES } from '../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { determineLearnerHasContentAssignmentsOnly } from './utils';
import { emptyRedeemableLearnerCreditPolicies } from './constants';

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
     * - `isAssignmentLearnerOnly`: true
     * - Has assignable redeemable policy with accepted assignment
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
              { state: ASSIGNMENT_TYPES.ACCEPTED },
            ],
          },
        ],
        learnerContentAssignments: {
          ...emptyRedeemableLearnerCreditPolicies.learnerContentAssignments,
          assignments: [{ state: ASSIGNMENT_TYPES.ACCEPTED }],
          hasAssignments: true,
          allocatedAssignments: [],
          hasAllocatedAssignments: false,
          acceptedAssignments: [{ state: ASSIGNMENT_TYPES.ACCEPTED }],
          hasAcceptedAssignments: true,
          assignmentsForDisplay: [],
          hasAssignmentsForDisplay: false,
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
    /**
     * - `isAssignmentLearnerOnly`: false
     * - Has no assignable redeemable policy
     * - Has no other redeemable policies (auto-applied)
     * - Has no enterprise offer
     * - Has no active subscription plan and/or activated license
     * - Has no subscription license request(s)
     * - Has no coupon codes
     * - Has no coupon code request(s)
     */
    {
      isAssignmentLearnerOnly: false,
      redeemableLearnerCreditPolicies: emptyRedeemableLearnerCreditPolicies,
      hasCurrentEnterpriseOffers: false,
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicense: undefined,
      licenseRequests: [],
      couponCodesCount: 0,
      couponCodeRequests: [],
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
