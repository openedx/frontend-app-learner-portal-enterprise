import { ASSIGNMENT_TYPES, ENTERPRISE_OFFER_TYPE, POLICY_TYPES } from '../constants';
import {
  getOfferType,
  isDisableCourseSearch,
  isOfferLowOnBalance,
  isOfferOutOfBalance,
  offerHasBookingsLimit,
  offerHasEnrollmentsLimit,
  transformEnterpriseOffer,
} from '../utils';
import { LICENSE_STATUS } from '../../../data/constants';

describe('offerHasBookingsLimit', () => {
  test.each([
    {
      offer: {
        maxDiscount: 300,
        maxUserDiscount: null,
      },
      expectedResult: true,
    },
    {
      offer: {
        maxDiscount: null,
        maxUserDiscount: 300,
      },
      expectedResult: true,
    },
    {
      offer: {
        maxDiscount: 300,
        maxUserDiscount: 300,
      },
      expectedResult: true,
    },
    {
      offer: {
        maxDiscount: null,
        maxUserDiscount: null,
      },
      expectedResult: false,
    },
  ])('should return true if offer has bookings limit', ({
    offer, expectedResult,
  }) => {
    expect(offerHasBookingsLimit(offer)).toEqual(expectedResult);
  });
});

describe('offerHasEnrollmentsLimit', () => {
  test.each([
    {
      offer: { maxGlobalApplications: 3 },
      expectedResult: true,
    },
    {
      offer: { maxGlobalApplications: null },
      expectedResult: false,
    },
  ])('should return true if offer has enrollments limit', (
    {
      offer, expectedResult,
    },
  ) => {
    expect(offerHasEnrollmentsLimit(offer)).toEqual(expectedResult);
  });
});

describe('getOfferType', () => {
  test.each([
    {
      offer: {
        maxDiscount: 100,
        maxGlobalApplications: 3,
        maxUserDiscount: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
    },
    {
      offer: {
        maxDiscount: 100,
        maxGlobalApplications: null,
        maxUserDiscount: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
    },
    {
      offer: {
        maxDiscount: null,
        maxGlobalApplications: null,
        maxUserDiscount: 100,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
    },
    {
      offer: {
        maxDiscount: null,
        maxGlobalApplications: 3,
        maxUserDiscount: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,
    },
    {
      offer: {
        maxDiscount: null,
        maxGlobalApplications: null,
        maxUserDiscount: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
    },
  ])('should get the correct offer type', ({ offer, expectedType }) => {
    expect(getOfferType(offer)).toEqual(expectedType);
  });
});

describe('isOfferLowOnBalance', () => {
  test.each([
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: null,
        remainingBalance: null,
        remainingBalanceForUser: null,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: null,
        remainingBalance: 5000,
        remainingBalanceForUser: null,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: null,
        remainingBalance: 1000,
        remainingBalanceForUser: null,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: 1000,
        remainingBalance: null,
        remainingBalanceForUser: 500,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: 1000,
        remainingBalance: null,
        remainingBalanceForUser: 149,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: 1000,
        remainingBalance: 3000,
        remainingBalanceForUser: 500,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: 1000,
        remainingBalance: 300,
        remainingBalanceForUser: 149,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: null,
        remainingBalance: 300,
        remainingBalanceForUser: 149,
      },
      expectedResult: false,
    },
  ])('should return true if offer has low balance', ({
    offer, expectedResult,
  }) => {
    expect(isOfferLowOnBalance(offer)).toEqual(expectedResult);
  });
});

describe('isOfferOutOfBalance', () => {
  test.each([
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: null,
        remainingBalance: null,
        remainingBalanceForUser: null,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: null,
        remainingBalance: 5000,
        remainingBalanceForUser: null,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: null,
        remainingBalance: 99,
        remainingBalanceForUser: null,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: 350,
        remainingBalance: null,
        remainingBalanceForUser: 200,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: null,
        maxUserDiscount: 350,
        remainingBalance: null,
        remainingBalanceForUser: 45,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: 500,
        remainingBalance: 5000,
        remainingBalanceForUser: 250,
      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 10000,
        maxUserDiscount: 500,
        remainingBalance: 90,
        remainingBalanceForUser: 45,
      },
      expectedResult: true,
    },
  ])('should return true if offer has no balance', ({
    offer, expectedResult,
  }) => {
    expect(isOfferOutOfBalance(offer)).toEqual(expectedResult);
  });
});

describe('transformEnterpriseOffer', () => {
  const mockOffer = {
    maxDiscount: null,
    maxUserDiscount: null,
    maxGlobalApplications: null,
    maxUserApplications: null,
    remainingBalance: null,
    remainingBalanceForUser: null,
    remainingApplications: null,
    remainingApplicationsForUser: null,
  };

  test.each([
    {
      offer: mockOffer,
      expectedResult: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
        maxDiscount: Number.MAX_VALUE,
        maxUserDiscount: Number.MAX_VALUE,
        maxGlobalApplications: Number.MAX_VALUE,
        maxUserApplications: Number.MAX_VALUE,
        remainingBalance: Number.MAX_VALUE,
        remainingBalanceForUser: Number.MAX_VALUE,
        remainingApplications: Number.MAX_VALUE,
        remainingApplicationsForUser: Number.MAX_VALUE,
        isLowOnBalance: false,
        isOutOfBalance: false,
      },
    },
    {
      offer: {
        ...mockOffer,
        remainingBalance: 100,
        maxDiscount: 2000,
      },
      expectedResult: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 2000,
        maxGlobalApplications: null,
        remainingBalance: 100,
        remainingBalanceForUser: null,
        isLowOnBalance: true,
        isOutOfBalance: false,
      },
    },
  ])('should transform offer', ({
    offer, expectedResult,
  }) => {
    expect(transformEnterpriseOffer(offer)).toEqual(expectedResult);
  });
});

describe('isDisableCourseSearch', () => {
  it.each([
    {
      isCourseSearchDisabled: false,
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
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          activeAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasActiveAssignments: true,
        },
      },
      enterpriseOffers: [{
        isCurrent: true,
      }],
      subscriptionPlan: {
        isActive: true,
      },
      subscriptionLicenses: {
        status: LICENSE_STATUS.ACTIVATED,
      },
    },
    {
      isCourseSearchDisabled: false,
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
            learnerContentAssignments: [],
          },
          {
            policyType: POLICY_TYPES.PER_ENROLLMENT_CREDIT,
            learnerContentAssignments: [],
          },
        ],
        learnerContentAssignments: {
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          activeAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasActiveAssignments: true,
        },
      },
      enterpriseOffers: [{
        isCurrent: true,
      }],
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicenses: {
        status: LICENSE_STATUS.ACTIVATED,
      },
    },
    {
      isCourseSearchDisabled: false,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.PER_LEARNER_CREDIT,
            learnerContentAssignments: [],
          },
          {
            policyType: POLICY_TYPES.PER_ENROLLMENT_CREDIT,
            learnerContentAssignments: [],
          },
        ],
        learnerContentAssignments: {
          assignments: [],
          hasAssignments: false,
          activeAssignments: [],
          hasActiveAssignments: false,
        },
      },
      enterpriseOffers: [{
        isCurrent: true,
      }],
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicenses: {
        status: LICENSE_STATUS.ACTIVATED,
      },
    },
    {
      isCourseSearchDisabled: true,
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
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          activeAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasActiveAssignments: true,
        },
      },
      enterpriseOffers: [{
        isCurrent: true,
      }],
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicenses: {
        status: LICENSE_STATUS.ACTIVATED,
      },
    },
    {
      isCourseSearchDisabled: true,
      redeemableLearnerCreditPolicies: {
        redeemablePolicies: [
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ACCEPTED },
            ],
          },
          {
            policyType: POLICY_TYPES.ASSIGNED_CREDIT,
            learnerContentAssignments: [
              { state: ASSIGNMENT_TYPES.ALLOCATED },
            ],
          },
        ],
        learnerContentAssignments: {
          assignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasAssignments: true,
          activeAssignments: [{ state: ASSIGNMENT_TYPES.ALLOCATED }],
          hasActiveAssignments: true,
        },
      },
      enterpriseOffers: [{
        isCurrent: false,
      }],
      subscriptionPlan: {
        isActive: false,
      },
      subscriptionLicenses: {
        status: LICENSE_STATUS.ACTIVATED,
      },
    },
  ])('isCourseSearchDisabled - (%p), (%s)', ({
    isCourseSearchDisabled,
    redeemableLearnerCreditPolicies,
    enterpriseOffers,
    subscriptionPlan,
    subscriptionLicenses,
  }) => {
    const isDisableSearch = isDisableCourseSearch(
      redeemableLearnerCreditPolicies,
      enterpriseOffers,
      subscriptionPlan,
      subscriptionLicenses,
    );
    expect(isDisableSearch).toEqual(isCourseSearchDisabled);
  });
});
