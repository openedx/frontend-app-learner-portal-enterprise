import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import '@testing-library/jest-dom/extend-expect';

import { getConfig } from '@edx/frontend-platform';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  DISABLED_ENROLL_REASON_TYPES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from '../constants';
import {
  courseUsesEntitlementPricing,
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getSubsidyToApplyForCourse,
  getLinkToCourse,
  pathContainsCourseTypeSlug,
  getCourseStartDate,
  getMissingSubsidyReasonActions,
  getSubscriptionDisabledEnrollmentReasonType,
  isActiveSubscriptionLicense,
  processCourseSubjects,
  isCurrentCoupon,
  getCouponCodesDisabledEnrollmentReasonType,
  getMissingApplicableSubsidyReason,
} from '../utils';

jest.mock('@edx/frontend-platform', () => ({
  ensureConfig: jest.fn(),
  getConfig: () => ({
    LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL: 'https://limits.url',
    LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL: 'https://deactivation.url',
    COURSE_TYPE_CONFIG: {
      entitlement_course: {
        pathSlug: 'executive-education-2u',
        usesEntitlementListPrice: true,
      },
      'executive-education-2u': {
        pathSlug: 'executive-education-2u',
        usesEntitlementListPrice: true,
        usesAdditionalMetadata: true,
      },
    },
  }),
}));

describe('findCouponCodeForCourse', () => {
  const couponCodes = [{
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: dayjs().subtract(1, 'w').toISOString(),
    couponEndDate: dayjs().add(8, 'w').toISOString(),
  }];

  test('returns valid index if coupon code catalog is in catalog list', () => {
    const catalogsWithCourse = ['cats', 'bears'];
    expect(findCouponCodeForCourse(couponCodes, catalogsWithCourse)).toEqual(couponCodes[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findCouponCodeForCourse(couponCodes)).toBeUndefined();
  });
});

describe('findEnterpriseOfferForCourse', () => {
  const coursePrice = 100;
  const enterpriseCatalogUuid = 'test-enterprise-catalog-uuid';
  const catalogsWithCourse = [enterpriseCatalogUuid];
  const baseOffer = { isCurrent: true };
  const offerNoLimit = {
    ...baseOffer,
    enterpriseCatalogUuid,
  };
  const offerRemainingBalanceNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 500,
  };
  const offerNotEnoughRemainingBalanceNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 50,
  };
  const offerNoRemainingBalanceNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 0,
  };
  const offerRemainingBalanceForUserNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 200,
  };
  const offerNotEnoughRemainingBalanceForUserNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 50,
  };
  const offerNoRemainingBalanceForUserNoApplications = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 0,
  };
  const offerRemainingApplicationsNoBalance = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingApplications: 10,
  };
  const offerNoRemainingApplicationsNoBalance = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingApplicationsForUser: 0,
  };
  const offerRemainingApplicationsForUserNoBalance = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 1,
  };
  const offerNoRemainingApplicationsForUserNoBalance = {
    ...baseOffer,
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 0,
  };

  it('returns undefined with no course price', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [offerRemainingBalanceForUserNoApplications],
      catalogsWithCourse,
      coursePrice: undefined,
    });
    expect(result).toEqual(undefined);
  });

  it('returns undefined with no enterprise offers', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [],
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(undefined);
  });

  it('returns undefined with no enterprise offers associated with catalog containing course', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [{ enterpriseCatalogUuid: 'not-in-catalog' }],
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(undefined);
  });

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
      offerNoRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsForUserNoBalance,
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

  it('returns the redeemable enterprise offer', () => {
    const enterpriseOffers = [
      offerRemainingBalanceNoApplications,
      offerNoRemainingBalanceNoApplications,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns enterprise offer with null balance before enterprise offer with null balance', () => {
    const enterpriseOffers = [
      offerNoLimit,
      offerRemainingBalanceNoApplications,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerNoLimit);
  });

  it('returns enterprise offer with less remaining balance', () => {
    const enterpriseOffers = [
      offerRemainingBalanceNoApplications,
      {
        ...offerRemainingBalanceNoApplications,
        remainingBalance: 800,
      },
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns enterprise offer with less remaining applications', () => {
    const enterpriseOffers = [
      offerRemainingApplicationsNoBalance,
      {
        ...offerRemainingApplicationsNoBalance,
        remainingApplications: 50,
      },
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingApplicationsNoBalance);
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

  it('returns applicableSubscriptionLicense over learner credit', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: mockApplicableSubscriptionLicense,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: true,
        redeemableSubsidyAccessPolicy: {},
      },
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
      applicableSubsidyAccessPolicy: {},
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
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
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

describe('getLinkToCourse', () => {
  const slug = 'testenterprise';
  const mockEntitlementCourse = {
    key: 'mock_entitlement_course',
    courseType: 'entitlement_course',
  };

  const mockNonEntitlementCourse = {
    key: 'mock_non_entitlement_course',
    courseType: 'non_entitlement_course',
  };

  const mockQueryObjectIdCourse = {
    key: 'mock_query_object_id_course',
    courseType: 'doesntmatter',
    queryId: 'testqueryid',
    objectId: 'testobjectid',
  };

  it('returns url with course type slug', () => {
    expect(getLinkToCourse(mockEntitlementCourse, slug)).toEqual('/testenterprise/executive-education-2u/course/mock_entitlement_course');
  });

  it('returns url without course type slug', () => {
    expect(getLinkToCourse(mockNonEntitlementCourse, slug)).toEqual('/testenterprise/course/mock_non_entitlement_course');
  });

  it('returns url with course queryId, objectId', () => {
    expect(getLinkToCourse(mockQueryObjectIdCourse, slug)).toEqual('/testenterprise/course/mock_query_object_id_course?queryId=testqueryid&objectId=testobjectid');
  });
});

describe('getCourseStartDate tests', () => {
  it('Validate additionalMetadata gets priority in course start date calculation', async () => {
    const mockAdditionalMetadataStartDate = '2023-06-10T12:00:00Z';
    const startDate = getCourseStartDate({
      contentMetadata: {
        additionalMetadata: {
          startDate: mockAdditionalMetadataStartDate,
        },
        courseType: 'executive-education-2u',
      },
      courseRun: {
        start: '2022-03-08T12:00:00Z',
      },
    });
    expect(startDate).toMatch(mockAdditionalMetadataStartDate);
  });

  it('Validate active course run\'s start date is used when additionalMetadata is null.', async () => {
    const mockCourseRuStartDate = '2022-03-08T12:00:00Z';
    const startDate = getCourseStartDate({
      contentMetadata: {
        additionalMetadata: null,
        courseType: 'executive-education-2u',
      },
      courseRun: {
        start: mockCourseRuStartDate,
      },
    });
    expect(startDate).toMatch(mockCourseRuStartDate);
  });

  it('Validate getCourseDate handles empty data for course run and course metadata.', async () => {
    const startDate = getCourseStartDate(
      { contentMetadata: null, courseRun: null },
    );
    expect(startDate).toBe(undefined);
  });
});

describe('getMissingSubsidyReasonActions', () => {
  it.each([
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
  ])('returns "Learn about limits" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Learn about limits');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('https://limits.url');
  });

  it(`returns "Learn about deactivation" CTA when \`reasonType\` is: ${DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED}`, () => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Learn about deactivation');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('https://deactivation.url');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  ])('returns enterpriseAdminUsers email "Contact administrator" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [{ email: 'admin@example.com' }],
      contactEmail: undefined,
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Contact administrator');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('mailto:admin@example.com');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  ])('returns contactEmail value in "Contact administrator" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [{ email: 'admin@example.com' }],
      contactEmail: 'testEmail@edx.org',
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Contact administrator');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('mailto:testEmail@edx.org');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  ])('returns no "Contact administrator" CTA when `reasonType` is %s and there are no enterprise admins', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    const { container } = render(ActionsComponent);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns no CTA when `reasonType` is unsupported', () => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType: 'invalid',
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    const { container } = render(ActionsComponent);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('getSubscriptionDisabledEnrollmentReasonType', () => {
  const mockCatalogUuid = 'test-catalog-uuid';

  it.each([
    {
      daysUntilExpirationIncludingRenewals: -17,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: -17,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: -17,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
    {
      daysUntilExpirationIncludingRenewals: 0,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: 10,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles expired subscription: %s', ({
    daysUntilExpirationIncludingRenewals,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals,
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      unassignedLicensesCount: 0,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      unassignedLicensesCount: 0,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      unassignedLicensesCount: 0,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
  ])('handles exhausted subscription: %s', ({
    unassignedLicensesCount,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals: 10,
          licenses: {
            unassigned: unassignedLicensesCount,
          },
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      subscriptionLicense: { status: 'revoked' },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      subscriptionLicense: { status: 'activated' },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles revoked/deactivated subscription license', ({
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals: 10,
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
  ])('handles no subscription license with remaining seats: %s', ({
    daysUntilExpirationIncludingRenewals,
    unassignedLicensesCount,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals,
          licenses: {
            unassigned: unassignedLicensesCount,
          },
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });
});

describe('isActiveSubscriptionLicense', () => {
  it.each([
    {
      subscriptionLicense: { status: 'activated' },
      expectedResult: true,
    },
    {
      subscriptionLicense: { status: 'revoked' },
      expectedResult: false,
    },
    {
      subscriptionLicense: { status: 'assigned' },
      expectedResult: false,
    },
    {
      subscriptionLicense: undefined,
      expectedResult: false,
    },
  ])('returns expected value given the following inputs: %s', ({ subscriptionLicense, expectedResult }) => {
    const isActive = isActiveSubscriptionLicense(subscriptionLicense);
    expect(isActive).toEqual(expectedResult);
  });
});

describe('processCourseSubjects', () => {
  it('handles null course', () => {
    const result = processCourseSubjects(null);
    expect(result).toEqual({
      primarySubject: null,
      subjects: [],
    });
  });

  it('handles empty subject list', () => {
    const course = { subjects: [] };
    const result = processCourseSubjects(course);
    expect(result).toEqual({
      primarySubject: null,
      subjects: [],
    });
  });

  it('handles course with subjects', () => {
    const mockSubject = {
      name: 'Subject 1',
      slug: 'subject-1',
    };
    const course = { subjects: [mockSubject] };
    const result = processCourseSubjects(course);
    expect(result).toEqual({
      primarySubject: {
        ...mockSubject,
        url: `${getConfig().MARKETING_SITE_BASE_URL}/course/subject/${mockSubject.slug}`,
      },
      subjects: [mockSubject],
    });
  });
});

describe('isCurrentCoupon', () => {
  afterEach(() => {
    MockDate.reset();
  });

  it.each([
    {
      todaysDate: '2023-08-02T12:00:00Z',
      couponStartDate: '2023-08-01T12:00:00Z',
      couponEndDate: '2023-08-03T12:00:00Z',
      expectedIsCurrent: true,
    },
    {
      todaysDate: '1976-05-05T12:00:00Z',
      couponStartDate: '2023-08-01T12:00:00Z',
      couponEndDate: '2024-08-01T12:00:00Z',
      expectedIsCurrent: false,
    },
    {
      todaysDate: '2024-10-31T12:00:00Z',
      couponStartDate: '2023-08-01T12:00:00Z',
      couponEndDate: '2024-08-01T12:00:00Z',
      expectedIsCurrent: false,
    },
  ])('handles the following case: %s', ({
    todaysDate,
    couponStartDate,
    couponEndDate,
    expectedIsCurrent,
  }) => {
    // mock current date
    MockDate.set(todaysDate);

    const coupon = {
      startDate: couponStartDate,
      endDate: couponEndDate,
    };
    const result = isCurrentCoupon(coupon);
    expect(result).toEqual(expectedIsCurrent);
  });
});

describe('getCouponCodesDisabledEnrollmentReasonType', () => {
  const testCatalogUuid = 'test-catalog-uuid';

  afterEach(() => {
    MockDate.reset();
  });

  it.each([
    {
      todaysDate: '2023-08-02T12:00:00Z',
      catalogsWithCourse: [],
      couponsOverview: [],
      hasEnterpriseAdminUsers: true,
      expectedResult: undefined,
    },
    {
      todaysDate: '2023-08-02T12:00:00Z',
      catalogsWithCourse: [testCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: testCatalogUuid,
        startDate: '2023-08-01T12:00:00Z',
        endDate: '2024-08-01T12:00:00Z',
        numUnassigned: 100,
      }],
      hasEnterpriseAdminUsers: true,
      expectedResult: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
    },
    {
      todaysDate: '2023-08-02T12:00:00Z',
      catalogsWithCourse: [testCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: testCatalogUuid,
        startDate: '2023-08-01T12:00:00Z',
        endDate: '2024-08-01T12:00:00Z',
        numUnassigned: 0,
      }],
      hasEnterpriseAdminUsers: true,
      expectedResult: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
    },
    {
      todaysDate: '2023-10-31T12:00:00Z',
      catalogsWithCourse: [testCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: testCatalogUuid,
        startDate: '2023-08-01T12:00:00Z',
        endDate: '2023-08-31T12:00:00Z',
        numUnassigned: 100,
      }],
      hasEnterpriseAdminUsers: true,
      expectedResult: DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED,
    },
  ])('handles the following case: %s', ({
    todaysDate,
    catalogsWithCourse,
    couponsOverview,
    hasEnterpriseAdminUsers,
    expectedResult,
  }) => {
    // mock current date
    MockDate.set(todaysDate);

    const args = {
      catalogsWithCourse,
      couponsOverview: { data: { results: couponsOverview } },
      hasEnterpriseAdminUsers,
    };
    const result = getCouponCodesDisabledEnrollmentReasonType(args);
    expect(result).toEqual(expectedResult);
  });
});

describe('getMissingApplicableSubsidyReason', () => {
  const baseMockData = {
    enterpriseAdminUsers: [{}],
    catalogsWithCourse: [],
    couponsOverview: {},
    customerAgreementConfig: {},
    subscriptionLicense: undefined,
    containsContentItems: true,
    missingSubsidyAccessPolicyReason: null,
    enterpriseOffers: [],
  };
  it('returns NO_SUBSIDY_NO_ADMINS if there are no admins', () => {
    const result = getMissingApplicableSubsidyReason({ ...baseMockData, enterpriseAdminUsers: [] });
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS);
  });

  it('returns CONTENT_NOT_IN_CATALOG if containsContentItems is false', () => {
    const result = getMissingApplicableSubsidyReason({ ...baseMockData, containsContentItems: false });
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG);
  });

  it('returns COUPON_CODE_NOT_ASSIGNED if there is no coupon code assigned', () => {
    const couponProperties = {
      todaysDate: '2023-08-02T12:00:00Z',
      couponStartDate: '2023-08-01T12:00:00Z',
      couponEndDate: '2023-08-03T12:00:00Z',
      expectedIsCurrent: true,
    };
    const mockData = {
      ...baseMockData,
      catalogsWithCourse: ['test-catalog-uuid'],
      couponsOverview:
      {
        data: {
          results: [{
            enterpriseCatalogUuid: 'test-catalog-uuid',
            numUnassigned: 100,
            ...couponProperties,
          }],
        },
      },
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED);
  });

  it('returns SUBSCRIPTION_EXPIRED if there is an expired subscription', () => {
    const subscriptionProperties = {
      daysUntilExpirationIncludingRenewals: -17,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
      catalogsWithCourse: ['test-catalog-uuid'],
    };
    const mockData = {
      ...baseMockData,
      catalogsWithCourse: ['test-catalog-uuid'],
      customerAgreementConfig: {
        subscriptions: [
          {
            enterpriseCatalogUuid: 'test-catalog-uuid',
            ...subscriptionProperties,
          },
        ],
      },
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED);
  });

  it('returns ENTERPRISE_OFFER_EXPIRED if there is an expired enterprise offer', () => {
    const enterpriseOfferProperties = {
      id: 1,
      usageType: 'Percentage',
      discountValue: 100,
      startDatetime: '2023-08-11',
      endDatetime: '2024-08-11',
    };
    const mockData = {
      ...baseMockData,
      enterpriseOffers: [enterpriseOfferProperties],
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED);
  });
});
