import { getConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import '@testing-library/jest-dom/extend-expect';

import { DISABLED_ENROLL_REASON_TYPES } from '../constants';
import {
  findEnterpriseOfferForCourse,
  getCouponCodesDisabledEnrollmentReasonType,
  getCourseStartDate,
  getLinkToCourse,
  getMissingApplicableSubsidyReason,
  getMissingSubsidyReasonActions,
  getSubscriptionDisabledEnrollmentReasonType,
  isActiveSubscriptionLicense,
  isCurrentCoupon,
  pathContainsCourseTypeSlug,
  processCourseSubjects,
  transformedCourseMetadata,
} from '../utils';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';
import { findCouponCodeForCourse } from '../../../app/data';

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
      },
    },
  }),
}));

const mockCatalogUuid = 'test-catalog-uuid';

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
  it('Validate getCourseDate handles empty data for course run and course metadata.', async () => {
    const startDate = getCourseStartDate(
      { courseRun: null },
    );
    expect(startDate).toBe(undefined);
  });
});

describe('getMissingSubsidyReasonActions', () => {
  const ActionsComponentWrapper = ({ children }) => (
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  );

  it.each([
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
  ])('returns "Learn about limits" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
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
    render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
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
    render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
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
    render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
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
    const { container } = render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns no CTA when `reasonType` is unsupported', () => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType: 'invalid',
      enterpriseAdminUsers: [],
      contactEmail: 'randomEmail@edx.org',
    });
    const { container } = render(<ActionsComponentWrapper>{ActionsComponent}</ActionsComponentWrapper>);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('getSubscriptionDisabledEnrollmentReasonType', () => {
  it.each([
    // No subscriptions for customer. Expected: undefined
    {
      customerAgreement: null,
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
    },
    // No applicable subscription plan for the course, mismatching catalogs. Expected: undefined
    {
      customerAgreement: {
        availableSubscriptionCatalogs: ['another-catalog-uuid'],
      },
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
    },
    // License not assigned. Expected: SUBSCRIPTION_LICENSE_NOT_ASSIGNED
    {
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
    },
    // License not assigned, no admins. Expected: SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS
    {
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
    },
  ])('handles no subscriptions and/or license: %s', ({
    customerAgreement,
    catalogsWithCourse,
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
  }) => {
    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreement,
      catalogsWithCourse,
      subscriptionLicense,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    // Expired license, with admins. Expected: SUBSCRIPTION_EXPIRED
    {
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: {
        status: LICENSE_STATUS.ACTIVATED,
        subscriptionPlan: {
          isCurrent: false,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    },
    // Expired license, without admins. Expected: SUBSCRIPTION_EXPIRED_NO_ADMINS
    {
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      catalogsWithCourse: [mockCatalogUuid],
      subscriptionLicense: {
        status: LICENSE_STATUS.ACTIVATED,
        subscriptionPlan: {
          isCurrent: false,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
    },
    // Current license, with admins. Expected: undefined
    {
      subscriptionLicense: {
        status: LICENSE_STATUS.ACTIVATED,
        subscriptionPlan: {
          isCurrent: true,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
    },
    // Current license, no admins. Expected: undefined
    {
      subscriptionLicense: {
        status: LICENSE_STATUS.ACTIVATED,
        subscriptionPlan: {
          isCurrent: true,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      hasEnterpriseAdminUsers: false,
      expectedReasonType: undefined,
    },
  ])('handles expired subscription: %s', ({
    customerAgreement,
    catalogsWithCourse,
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
  }) => {
    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreement,
      catalogsWithCourse,
      subscriptionLicense,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  // Test skipped due to the learner-licenses API, it does not include information related
  // to exhausted seats previously returned by a separate API that is no longer called.
  // TODO: once the learner-licenses api supports exhausted seats, reimplement and verify tests
  it.skip.each([
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
    const customerAgreement = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals: 10,
          licenses: {
            unassigned: unassignedLicensesCount,
          },
        },
      ],
      availableSubscriptionCatalogs: [mockCatalogUuid],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreement,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      subscriptionLicense: {
        status: 'revoked',
        subscriptionPlan: {
          enterpriseCatalogUuid: mockCatalogUuid,
          isCurrent: true,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      subscriptionLicense: {
        status: 'activated',
        subscriptionPlan: {
          enterpriseCatalogUuid: mockCatalogUuid,
          isCurrent: true,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles revoked/deactivated subscription license: %s', ({
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreement = {
      availableSubscriptionCatalogs: [mockCatalogUuid],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreement,
      catalogsWithCourse,
      subscriptionLicense,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      subscriptionLicense: {
        subscriptionPlan: {
          isCurrent: true,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      subscriptionLicense: {
        subscriptionPlan: {
          isCurrent: true,
        },
      },
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      subscriptionLicense: {
        subscriptionPlan: {
          isCurrent: true,
        },
      },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
  ])('handles no subscription license with remaining seats: %s', ({
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreement = {
      availableSubscriptionCatalogs: [mockCatalogUuid],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreement,
      catalogsWithCourse,
      subscriptionLicense,
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
      catalogsWithCourse: [mockCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: mockCatalogUuid,
        startDate: '2023-08-01T12:00:00Z',
        endDate: '2024-08-01T12:00:00Z',
        numUnassigned: 100,
      }],
      hasEnterpriseAdminUsers: true,
      expectedResult: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
    },
    {
      todaysDate: '2023-08-02T12:00:00Z',
      catalogsWithCourse: [mockCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: mockCatalogUuid,
        startDate: '2023-08-01T12:00:00Z',
        endDate: '2024-08-01T12:00:00Z',
        numUnassigned: 0,
      }],
      hasEnterpriseAdminUsers: true,
      expectedResult: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
    },
    {
      todaysDate: '2023-10-31T12:00:00Z',
      catalogsWithCourse: [mockCatalogUuid],
      couponsOverview: [{
        enterpriseCatalogUuid: mockCatalogUuid,
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
    enterpriseAdminUsers: [{
      email: 'edx@example.com',
      lmsUserId: 3,
    }],
    catalogsWithCourse: [],
    couponsOverview: {},
    customerAgreement: {
      availableSubscriptionCatalogs: [],
    },
    subscriptionLicense: undefined,
    containsContentItems: true,
    missingSubsidyAccessPolicyReason: null,
    enterpriseOffers: [],
  };

  it('returns NO_SUBSIDY_NO_ADMINS if there are no admins', () => {
    const result = getMissingApplicableSubsidyReason({
      ...baseMockData,
      enterpriseAdminUsers: [],
    });
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS);
  });

  it('returns NO_SUBSIDY if there are admins but no subsidy', () => {
    const result = getMissingApplicableSubsidyReason(baseMockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY);
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
      catalogsWithCourse: [mockCatalogUuid],
      couponsOverview:
      {
        data: {
          results: [{
            enterpriseCatalogUuid: mockCatalogUuid,
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
    const mockData = {
      ...baseMockData,
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      subscriptionLicense: {
        // Subscription license is activated, but expired.
        status: LICENSE_STATUS.ACTIVATED,
        subscriptionPlan: {
          isCurrent: false,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      catalogsWithCourse: [mockCatalogUuid],
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED);
  });

  it('returns SUBSCRIPTION_DEACTIVATED if the subscription is deactivated', () => {
    const mockData = {
      ...baseMockData,
      customerAgreement: {
        availableSubscriptionCatalogs: [mockCatalogUuid],
      },
      subscriptionLicense: {
        // Subscription license is current but deactivated (revoked).
        status: LICENSE_STATUS.REVOKED,
        subscriptionPlan: {
          isCurrent: true,
          enterpriseCatalogUuid: mockCatalogUuid,
        },
      },
      catalogsWithCourse: [mockCatalogUuid],
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED);
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

  it('returns MISSING_SUBSIDY_ACCESS_POLICY if missingSubsidyAccessPolicyReason is present', () => {
    const mockData = {
      ...baseMockData,
      missingSubsidyAccessPolicyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.MISSING_SUBSIDY_ACCESS_POLICY,
        userMessage: 'Custom user message.',
      },
    };
    const result = getMissingApplicableSubsidyReason(mockData);
    expect(result.reason).toEqual(DISABLED_ENROLL_REASON_TYPES.MISSING_SUBSIDY_ACCESS_POLICY);
    expect(result.userMessage).toEqual('Custom user message.');
  });
});

describe('transformedCourseMetadata', () => {
  const mockOrgName = 'Fake Org Name';
  const mockLogoImageUrl = 'https://fake-logo.url';
  const mockOrgMarketingUrl = 'https://fake-mktg.url';
  const mockWeeksToComplete = 8;
  const mockListPrice = [100];
  const mockCurrency = 'USD';
  const mockCourseTitle = 'Test Course Title';
  const mockCourseRunStartDate = '2023-04-20T12:00:00Z';
  const mockCourseRunKey = 'course-v1:edX+DemoX+Demo_Course';
  const mockActiveCourseRunKey = 'course-v2:edX+DemoX+Demo_Course';
  const mockActiveCourseRunStartDate = '2024-04-20T12:00:00Z';
  const mockActiveCourseRunWeeksToComplete = 16;

  const transformed = {
    organization: {
      name: mockOrgName,
      logoImgUrl: mockLogoImageUrl,
      marketingUrl: mockOrgMarketingUrl,
    },
    title: mockCourseTitle,
    startDate: mockCourseRunStartDate,
    duration: `${mockWeeksToComplete} Weeks`,
    priceDetails: {
      price: mockListPrice,
      currency: mockCurrency,
    },
    courseRuns: [{
      key: mockCourseRunKey,
      weeksToComplete: mockWeeksToComplete,
      start: mockCourseRunStartDate,
    }],
    owners: [{
      name: mockOrgName,
      marketingUrl: mockOrgMarketingUrl,
      logoImageUrl: mockLogoImageUrl,
    }],
    activeCourseRun: {
      key: mockActiveCourseRunKey,
      weeksToComplete: mockActiveCourseRunWeeksToComplete,
      start: mockActiveCourseRunStartDate,
    },
  };
  const coursePrice = {
    listRange: mockListPrice,
  };
  const expectedValue = {
    duration: '8 Weeks',
    organization: {
      logoImgUrl: 'https://fake-logo.url',
      marketingUrl: 'https://fake-mktg.url',
      name: 'Fake Org Name',
    },
    priceDetails: {
      currency: 'USD',
      price: [100],
    },
    startDate: '2023-04-20T12:00:00Z',
    title: 'Test Course Title',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the minimal course metadata with typical values, happy path', () => {
    const minimalCourseMetadata = transformedCourseMetadata({
      transformed,
      coursePrice,
      courseRunKey: mockCourseRunKey,
      currency: mockCurrency,
    });
    expect(minimalCourseMetadata).toEqual(expectedValue);
  });
  it('fallsback to activeCourseRun if no course run key matches', () => {
    const minimalCourseMetadata = transformedCourseMetadata({
      transformed,
      coursePrice,
      courseRunKey: mockActiveCourseRunKey,
      currency: mockCurrency,
    });
    const updatedExpectedValue = {
      ...expectedValue,
      startDate: mockActiveCourseRunStartDate,
      duration: '16 Weeks',
    };
    expect(minimalCourseMetadata).toEqual(updatedExpectedValue);
  });
  it.each([
    {
      organizationShortCodeOverride: null,
      organizationLogoOverrideUrl: null,
      owners: [{
        name: mockOrgName,
        marketingUrl: mockOrgMarketingUrl,
        logoImageUrl: mockLogoImageUrl,
        uuid: 'test-uuid',
        key: 'test-key',
      }],
      organization: {
        logoImgUrl: 'https://fake-logo.url',
        marketingUrl: 'https://fake-mktg.url',
        name: 'Fake Org Name',
      },
    },
    {
      organizationShortCodeOverride: 'test-short-code-override',
      organizationLogoOverrideUrl: 'test-logo-override',
      owners: [{
        name: mockOrgName,
        marketingUrl: mockOrgMarketingUrl,
        logoImageUrl: mockLogoImageUrl,
        uuid: 'test-uuid',
        key: 'test-key',
      }],
      organization: {
        logoImgUrl: 'test-logo-override',
        marketingUrl: 'https://fake-mktg.url',
        name: 'test-short-code-override',
      },
    },
  ])('handles organizations correctly when values are %s', ({
    organizationShortCodeOverride,
    organizationLogoOverrideUrl,
    owners,
    organization,
  }) => {
    const updatedTransformedData = {
      ...transformed,
      organizationLogoOverrideUrl,
      organizationShortCodeOverride,
      owners,
    };
    const minimalCourseMetadata = transformedCourseMetadata({
      transformed: updatedTransformedData,
      coursePrice,
      courseRunKey: mockCourseRunKey,
      currency: mockCurrency,
    });
    expect(minimalCourseMetadata.organization).toEqual(organization);
  });
  it.each([{
    courseRuns: [{
      key: mockCourseRunKey,
      weeksToComplete: mockWeeksToComplete,
      start: mockCourseRunStartDate,
    }],
    duration: '8 Weeks',
  },
  {
    courseRuns: [{
      key: mockCourseRunKey,
      weeksToComplete: 1,
      start: mockCourseRunStartDate,
    }],
    duration: '1 Week',
  },
  {
    courseRuns: [],
    duration: '-',
  },
  ])('handles duration correctly when values are %s', ({
    courseRuns,
    duration,
  }) => {
    const updatedTransformed = { ...transformed, courseRuns };
    if (courseRuns.length === 0) {
      updatedTransformed.activeCourseRun = null;
    }
    const minimalCourseMetadata = transformedCourseMetadata({
      transformed: updatedTransformed,
      coursePrice,
      courseRunKey: mockCourseRunKey,
      currency: mockCurrency,
    });
    expect(minimalCourseMetadata.duration).toEqual(duration);
  });
});
