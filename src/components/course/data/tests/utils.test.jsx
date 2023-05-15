import moment from 'moment';
import { ENTERPRISE_OFFER_TYPE } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from '../constants';
import {
  compareOffersByProperty,
  courseUsesEntitlementPricing,
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getSubsidyToApplyForCourse,
  linkToCourse,
  pathContainsCourseTypeSlug,
} from '../utils';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => ({
    COURSE_TYPE_CONFIG: {
      entitlement_course: {
        pathSlug: 'executive-education-2u',
        usesEntitlementListPrice: true,
      },
    },
  }),
}));

describe('findCouponCodeForCourse', () => {
  const couponCodes = [{
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: moment().subtract(1, 'w').toISOString(),
    couponEndDate: moment().add(8, 'w').toISOString(),
  }];

  test('returns valid index if coupon code catalog is in catalog list', () => {
    const catalogsWithCourse = ['cats', 'bears'];
    expect(findCouponCodeForCourse(couponCodes, catalogsWithCourse)).toEqual(couponCodes[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findCouponCodeForCourse(couponCodes)).toBeUndefined();
  });
});

describe.only('[NEW] findEnterpriseOfferForCourse', () => {
  const coursePrice = 100;
  const enterpriseCatalogUuid = 'test-enterprise-catalog-uuid';
  const catalogsWithCourse = [enterpriseCatalogUuid];
  const offerNoLimit = {
    enterpriseCatalogUuid,
  };
  const offerRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
  };
  const offerNotEnoughRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 50,
  };
  const offerNoRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 0,
  };
  const offerRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 200,
  };
  const offerNotEnoughRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 50,
  };
  const offerNoRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 0,
  };

  const offerRemainingApplicationsNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
  };
  const offerNoRemainingApplicationsNoBalance = {
    enterpriseCatalogUuid,
    remainingApplicationsForUser: 0,
  };
  const offerRemainingApplicationsForUserNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 1,
  };
  const offerNoRemainingApplicationsForUserNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 0,
  };

  it('returns offer with no limit first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
      offerNoLimit,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerNoLimit);
  });

  it('returns offer with remaining balance for user first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceForUserNoApplications);
  });

  it('returns offer with remaining balance first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns offer with remaining applications for user first', () => {
    const enterpriseOffers = [
      offerNoRemainingBalanceNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingApplicationsForUserNoBalance);
  });
});

describe('findEnterpriseOfferForCourse', () => {
  const enterpriseOffers = [
    { enterpriseCatalogUuid: 'cats' },
    { enterpriseCatalogUuid: 'horses' },
    { enterpriseCatalogUuid: 'cats' },
  ];

  it('returns undefined if there is no course price', () => {
    const catalogsWithCourse = ['cats', 'bears'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogsWithCourse,
    })).toBeUndefined();
  });

  it('returns undefined if there is no enterprise offer for the course', () => {
    const catalogsWithCourse = ['pigs'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogsWithCourse, coursePrice: 100,
    })).toBeUndefined();
  });

  describe('offerType = (BOOKINGS_LIMIT || BOOKINGS_AND_ENROLLMENTS_LIMIT)', () => {
    it.each([
      ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
      ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
    ])('returns the enterprise offer with a valid catalog that has remaining balance >= course price', (
      offerType,
    ) => {
      const catalogsWithCourse = ['cats', 'bears'];
      expect(findEnterpriseOfferForCourse({
        enterpriseOffers: enterpriseOffers.map(offer => ({
          ...offer, offerType, remainingBalance: 100,
        })),
        catalogsWithCourse,
        coursePrice: 100,
      })).toStrictEqual({
        ...enterpriseOffers[2],
        offerType,
        remainingBalance: 100,
      });
    });
  });

  describe('offerType = (NO_LIMIT || ENROLLMENTS_LIMIT)', () => {
    it.each([
      ENTERPRISE_OFFER_TYPE.NO_LIMIT,
      ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT,
    ])('returns the enterprise offer with a valid catalog', (
      offerType,
    ) => {
      const catalogsWithCourse = ['cats', 'bears'];
      expect(findEnterpriseOfferForCourse({
        enterpriseOffers: enterpriseOffers.map(offer => ({
          ...offer, offerType, maxGlobalApplications: 100,
        })),
        catalogsWithCourse,
        coursePrice: 100,
      })).toStrictEqual({
        ...enterpriseOffers[2],
        offerType,
        maxGlobalApplications: 100,
      });
    });
  });
});

describe('getSubsidyToApplyForCourse', () => {
  const mockApplicableSubscriptionLicense = {
    uuid: 'license-uuid',
  };

  const mockApplicableCouponCode = {
    uuid: 'coupon-code-uuid',
    usageType: 'percentage',
    benefitValue: 100,
    couponStartDate: '2023-08-11',
    couponEndDate: '2024-08-11',
    code: 'xyz',
  };

  const mockApplicableEnterpriseOffer = {
    id: 1,
    usageType: 'Percentage',
    discountValue: 100,
    startDatetime: '2023-08-11',
    endDatetime: '2024-08-11',
  };

  it('returns applicableSubscriptionLicense', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: mockApplicableSubscriptionLicense,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      ...mockApplicableSubscriptionLicense,
      subsidyType: LICENSE_SUBSIDY_TYPE,
    });
  });

  it('returns applicableCouponCode if there is no applicableSubscriptionLicense', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableCouponCode.usageType,
      discountValue: mockApplicableCouponCode.benefitValue,
      startDate: mockApplicableCouponCode.couponStartDate,
      endDate: mockApplicableCouponCode.couponEndDate,
      code: mockApplicableCouponCode.code,
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
  });

  it('returns applicableEnterpriseOffer if there is no applicableSubscriptionLicense or applicableCouponCode', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableEnterpriseOffer.usageType.toLowerCase(),
      discountValue: mockApplicableEnterpriseOffer.discountValue,
      startDate: mockApplicableEnterpriseOffer.startDatetime,
      endDate: mockApplicableEnterpriseOffer.endDatetime,
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
  });

  it('returns null if there are no applicable subsidies', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
    });

    expect(subsidyToApply).toBeUndefined();
  });
});

describe('courseUsesEntitlementPricing', () => {
  const mockEntitlementCourse = {
    courseType: 'entitlement_course',
  };

  const mockNonEntitlementCourse = {
    courseType: 'non_entitlement_course',
  };

  it('Returns true when course type included in COURSE_TYPE_CONFIG usesEntitlementListPrice is true', () => {
    expect(courseUsesEntitlementPricing(mockEntitlementCourse)).toEqual(true);
  });

  it('Returns false when course type not included in COURSE_TYPE_CONFIG', () => {
    expect(courseUsesEntitlementPricing(mockNonEntitlementCourse)).toEqual(false);
  });
});

describe('pathContainsCourseTypeSlug', () => {
  it('returns true with matching course type slug', () => {
    expect(pathContainsCourseTypeSlug('/testenterprise/executive-education-2u/course/mock_entitlement_course', 'entitlement_course')).toEqual(true);
  });

  it('returns false without matching course type slug', () => {
    expect(pathContainsCourseTypeSlug('/testenterprise/executive-education-2u/course/mock_entitlement_course', 'non_entitlement_course')).toEqual(false);
  });
});

describe('linkToCourse', () => {
  const slug = 'testenterprise';
  const mockEntitlementCourse = {
    key: 'mock_entitlement_course',
    courseType: 'entitlement_course',
  };

  const mockNonEntitlementCourse = {
    key: 'mock_non_entitlement_course',
    courseType: 'non_entitlement_course',
  };

  const mockQueryQbjectIdCourse = {
    key: 'mock_query_object_id_course',
    courseType: 'doesntmatter',
    queryId: 'testqueryid',
    objectId: 'testobjectid',
  };

  it('returns url with course type slug', () => {
    expect(linkToCourse(mockEntitlementCourse, slug)).toEqual('/testenterprise/executive-education-2u/course/mock_entitlement_course');
  });

  it('returns url without course type slug', () => {
    expect(linkToCourse(mockNonEntitlementCourse, slug)).toEqual('/testenterprise/course/mock_non_entitlement_course');
  });

  it('returns url with course queryId, objectId', () => {
    expect(linkToCourse(mockQueryQbjectIdCourse, slug)).toEqual('/testenterprise/course/mock_query_object_id_course?queryId=testqueryid&objectId=testobjectid');
  });
});

describe('compareOffersByProperty', () => {
  it('returns 0 with incorrect inputs, or no other conditional matches', () => {
    const firstOffer = {};
    const secondOffer = {};
    const result = compareOffersByProperty({ firstOffer, secondOffer });
    expect(result).toEqual(undefined);
  });

  it.each([
    {
      firstOfferValue: 50,
      secondOfferValue: 100,
      property: 'remainingBalanceForUser',
      expectedResult: -1,
    },
    {
      firstOfferValue: 100,
      secondOfferValue: 50,
      property: 'remainingBalanceForUser',
      expectedResult: 1,
    },
    {
      firstOfferValue: undefined,
      secondOfferValue: 100,
      property: 'remainingBalanceForUser',
      expectedResult: -1,
    },
    {
      firstOfferValue: 100,
      secondOfferValue: undefined,
      property: 'remainingBalanceForUser',
      expectedResult: 1,
    },
  ])('returns expected result with the given inputs: %s', ({
    firstOfferValue,
    secondOfferValue,
    property,
    expectedResult,
  }) => {
    const firstOffer = {
      [property]: firstOfferValue,
    };
    const secondOffer = {
      [property]: secondOfferValue,
    };
    const result = compareOffersByProperty({ firstOffer, secondOffer, property });
    expect(result).toEqual(expectedResult);
  });
});
