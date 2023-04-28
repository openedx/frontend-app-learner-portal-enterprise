import moment from 'moment';
import { ENTERPRISE_OFFER_TYPE } from '../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from '../constants';
import {
  courseUsesEntitlementPricing, findCouponCodeForCourse, findEnterpriseOfferForCourse, getSubsidyToApplyForCourse,
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
    const catalogList = ['cats', 'bears'];
    expect(findCouponCodeForCourse(couponCodes, catalogList)).toEqual(couponCodes[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findCouponCodeForCourse(couponCodes)).toBeUndefined();
  });
});

describe('findEnterpriseOfferForCourse', () => {
  const enterpriseOffers = [
    {
      enterpriseCatalogUuid: 'cats',
    },
    {
      enterpriseCatalogUuid: 'horses',
    },
    {
      enterpriseCatalogUuid: 'cats',
    },
  ];

  it('returns undefined if there is no course price', () => {
    const catalogList = ['cats', 'bears'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogList,
    })).toBeUndefined();
  });

  it('returns undefined if there is no enterprise offer for the course', () => {
    const catalogList = ['pigs'];
    expect(findEnterpriseOfferForCourse({
      enterpriseOffers, catalogList, coursePrice: 100,
    })).toBeUndefined();
  });

  describe('offerType = (BOOKINGS_LIMIT || BOOKINGS_AND_ENROLLMENTS_LIMIT)', () => {
    it.each([
      ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
      ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
    ])('returns the enterprise offer with a valid catalog that has remaining balance >= course price', (
      offerType,
    ) => {
      const catalogList = ['cats', 'bears'];
      expect(findEnterpriseOfferForCourse({
        enterpriseOffers: enterpriseOffers.map(offer => ({
          ...offer, offerType, remainingBalance: 100,
        })),
        catalogList,
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
      const catalogList = ['cats', 'bears'];
      expect(findEnterpriseOfferForCourse({
        enterpriseOffers: enterpriseOffers.map(offer => ({
          ...offer, offerType, maxGlobalApplications: 100,
        })),
        catalogList,
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

    expect(subsidyToApply).toBeNull();
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
