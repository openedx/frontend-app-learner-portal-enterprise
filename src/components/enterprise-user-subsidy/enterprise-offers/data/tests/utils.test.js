import { ENTERPRISE_OFFER_TYPE } from '../constants';
import {
  getOfferType, isOfferLowOnBalance, offerHasBookingsLimit, offerHasEnrollmentsLimit, transformEnterpriseOffer,
} from '../utils';

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
      offer: {
        maxGlobalApplications: 3,
      },
      expectedResult: true,
    },
    {
      offer: {
        maxGlobalApplications: null,
      },
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
        remainingBalance: 100,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        remainingBalance: 201,
      },
      expectedResult: false,
    },

  ])('should return true if offer has low balance', ({
    offer, expectedResult,
  }) => {
    expect(isOfferLowOnBalance(offer)).toEqual(expectedResult);
  });
});

describe('transformEnterpriseOffer', () => {
  const mockOffer = {
    maxDiscount: null,
    maxGlobalApplications: null,
    maxUserDiscount: null,
    remainingBalance: null,
    remainingBalanceForUser: null,
  };

  test.each([
    {
      offer: mockOffer,
      expectedResult: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
        maxDiscount: Number.MAX_VALUE,
        maxGlobalApplications: Number.MAX_VALUE,
        remainingBalance: Number.MAX_VALUE,
        remainingBalanceForUser: Number.MAX_VALUE,
        isLowOnBalance: false,
      },
    },
    {
      offer: {
        ...mockOffer,
        remainingBalance: 100,
        maxDiscount: 200,
      },
      expectedResult: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 200,
        maxGlobalApplications: null,
        remainingBalance: 100,
        remainingBalanceForUser: null,
        isLowOnBalance: true,
      },
    },
  ])('should transform offer', ({
    offer, expectedResult,
  }) => {
    expect(transformEnterpriseOffer(offer)).toEqual(expectedResult);
  });
});
