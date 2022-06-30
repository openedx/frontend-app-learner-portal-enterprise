import { ENTERPRISE_OFFER_TYPE } from '../constants';
import {
  getOfferType, isOfferLowOnBalance, offerHasBookingsLimit, transformEnterpriseOffer,
} from '../utils';

describe('getOfferType', () => {
  test.each([
    {
      offer: {
        maxDiscount: 100,
        maxGlobalApplications: 3,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
    },
    {
      offer: {
        maxDiscount: 100,
        maxGlobalApplications: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
    },
    {
      offer: {
        maxDiscount: null,
        maxGlobalApplications: 3,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,
    },
    {
      offer: {
        maxDiscount: null,
        maxGlobalApplications: null,
      },
      expectedType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
    },
  ])('should get the correct offer type', ({ offer, expectedType }) => {
    expect(getOfferType(offer)).toEqual(expectedType);
  });
});

describe('offerHasBookingsLimit', () => {
  test.each([
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,

      },
      expectedResult: true,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,

      },
      expectedResult: false,
    },
    {
      offer: {
        offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,

      },
      expectedResult: false,
    },
  ])('should return true if offer has bookings limit', ({
    offer, expectedResult,
  }) => {
    expect(offerHasBookingsLimit(offer)).toEqual(expectedResult);
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
    offerType: ENTERPRISE_OFFER_TYPE.NO_LIMIT,
    maxDiscount: null,
    remainingBalance: null,
    maxGlobalApplications: null,
  };

  test.each([
    {
      offer: mockOffer,
      expectedResult: {
        ...mockOffer,
        maxDiscount: Number.MAX_VALUE,
        remainingBalance: Number.MAX_VALUE,
        maxGlobalApplications: Number.MAX_VALUE,
        isLowOnBalance: false,
      },
    },
    {
      offer: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        remainingBalance: 100,
        maxDiscount: 200,
      },
      expectedResult: {
        ...mockOffer,
        offerType: ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
        maxDiscount: 200,
        remainingBalance: 100,
        maxGlobalApplications: null,
        isLowOnBalance: true,
      },
    },
  ])('should transform offer', ({
    offer, expectedResult,
  }) => {
    expect(transformEnterpriseOffer(offer)).toEqual(expectedResult);
  });
});
