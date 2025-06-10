import { useParams } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';

import { DISABLED_ENROLL_REASON_TYPES, DISABLED_ENROLL_USER_MESSAGES, REASON_USER_MESSAGES } from '../../constants';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  findCouponCodeForCourse,
  getSubsidyToApplyForCourse,
  LEARNER_CREDIT_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
  useCouponCodes,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useCourseCanRequestEligibility,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContentSuspense,
  useEnterpriseOffers,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../../app/data';
import useUserSubsidyApplicableToCourse from '../useUserSubsidyApplicableToCourse';
import {
  findEnterpriseOfferForCourse,
  getMissingApplicableSubsidyReason,
  getSubscriptionDisabledEnrollmentReasonType,
} from '../../utils';
import { enterpriseCustomerFactory } from '../../../../app/data/services/data/__factories__';
import { mockSubscriptionLicense } from '../../../tests/constants';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';

const mockEnterpriseCustomer = enterpriseCustomerFactory();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('../../../../app/data', () => ({
  ...jest.requireActual('../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useCourseMetadata: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useCourseRedemptionEligibility: jest.fn(),
  useCourseCanRequestEligibility: jest.fn(),
  useSubscriptions: jest.fn(),
  useEnterpriseCustomerContainsContentSuspense: jest.fn(),
  useEnterpriseOffers: jest.fn(),
  useCouponCodes: jest.fn(),
  getSubsidyToApplyForCourse: jest.fn(),
  findCouponCodeForCourse: jest.fn(),
}));

jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  getMissingApplicableSubsidyReason: jest.fn(),
  getSubscriptionDisabledEnrollmentReasonType: jest.fn(),
  findEnterpriseOfferForCourse: jest.fn(),
}));

describe('useUserSubsidyApplicableToCourse', () => {
  const mockCatalogUUID = 'test-enterprise-catalog-uuid';
  const baseArgs = {
    isPolicyRedemptionEnabled: false,
    courseData: {
      catalog: {
        containsContentItems: true,
        catalogList: [mockCatalogUUID],
      },
      courseDetails: {
        uuid: 'test-course-uuid',
        key: 'edX+DemoX',
      },
    },
    enterpriseAdminUsers: [],
    customerAgreementConfig: undefined,
    contactEmail: undefined,
  };
  const missingUserSubsidyReason = {
    reason: DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    userMessage: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
    metadata: { enterpriseAdministrators: ['edx@example.com'] },
  };
  const expectedTransformedMissingUserSubsidyReason = {
    reason: DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    userMessage: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
    actions: expect.any(Object),
  };
  const resolvedTransformedEnterpriseCustomerData = ({ transformed }) => ({
    fallbackAdminUsers: transformed.adminUsers.map(user => user.email),
    contactEmail: transformed.contactEmail,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useEnterpriseCustomer.mockReturnValue({
      data: resolvedTransformedEnterpriseCustomerData({ transformed: mockEnterpriseCustomer }),
    });
    useCourseMetadata.mockReturnValue({ key: 'edX+DemoX' });
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [],
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({ data: {} });
    useCourseCanRequestEligibility.mockReturnValue({
      data: {
        canRequest: false,
        requestableSubsidyAccessPolicy: null,
        reason: null,
      },
      isPending: false,
    });
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: undefined,
        subscriptionLicense: undefined,
        subscriptionPlan: undefined,
      },
    });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useEnterpriseOffers.mockReturnValue({
      data: {
        enterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
      },
    });
    useCouponCodes.mockReturnValue({
      data: {
        couponCodeAssignments: [],
      },
    });
  });

  it('handles null course data', () => {
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());
    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('handles course data with redeemable subsidy access policy', () => {
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LEARNER_CREDIT_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('does not have redeemable subsidy access policy and catalog(s) does not contain course', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
      userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG],
      actions: null,
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG],
        actions: null,
      },
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it.each([
    { enterpriseAdminUsers: [] },
    { enterpriseAdminUsers: ['edx@example.com'] },
  ])('does not have redeemable subsidy access policy and catalog(s) contains course (%s)', ({ enterpriseAdminUsers }) => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: enterpriseAdminUsers.length > 0
        ? DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY
        : DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS,
      userMessage: enterpriseAdminUsers.length > 0
        ? DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY]
        : DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS],
      actions: null,
    });
    useEnterpriseCustomer.mockReturnValue({
      data: {
        ...mockEnterpriseCustomer,
        enterpriseAdminUsers,
      },
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    let expectedReasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS;
    let expectedAction = null;

    if (enterpriseAdminUsers.length > 0) {
      expectedReasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY;
      expectedAction = expect.any(Object);
    }

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: expectedReasonType,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[expectedReasonType],
        actions: expectedAction,
      },
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('does not have redeemable subsidy access policy and has missing subsidy access policy user message', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: missingUserSubsidyReason.reason,
      userMessage: missingUserSubsidyReason.userMessage,
      actions: null,
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: expectedTransformedMissingUserSubsidyReason,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('finds applicable subscription license', () => {
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: LICENSE_SUBSIDY_TYPE,
    });

    useSubscriptions.mockReturnValueOnce({
      data: {
        subscriptionLicense: {
          ...mockSubscriptionLicense,
          status: LICENSE_STATUS.ACTIVATED,
          discountType: 'percentage',
          discountValue: 100,
          subscriptionPlan: {
            enterpriseCatalogUuid: 'test-catalog-uuid',
            isCurrent: true,
          },
        },
      },
    });

    useEnterpriseCustomerContainsContentSuspense.mockReturnValueOnce({
      data: {
        catalogList: ['test-catalog-uuid'],
        containsContentItems: true,
      },
    });
    useCourseRedemptionEligibility.mockReturnValue({
      data: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: undefined,
      },
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableSubscriptionLicense: {
        ...mockSubscriptionLicense,
        status: LICENSE_STATUS.ACTIVATED,
        discountType: 'percentage',
        discountValue: 100,
        subscriptionPlan: {
          enterpriseCatalogUuid: 'test-catalog-uuid',
          isCurrent: true,
        },
      },
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: null,
        availableCourseRuns: [],
      },
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: LICENSE_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('handles disabled enrollment reason related to subscriptions', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
      userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS],
      actions: {},
    });
    useSubscriptions.mockReturnValueOnce({
      data: {
        subscriptionLicense: {
          ...mockSubscriptionLicense,
          status: LICENSE_STATUS.ACTIVATED,
          discountType: 'percentage',
          discountValue: 100,
          subscriptionPlan: {
            enterpriseCatalogUuid: 'test-catalog-uuid',
            isCurrent: false,
          },
        },
      },
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
        userMessage: REASON_USER_MESSAGES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
        actions: expect.any(Object),
      },
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('handles disabled enrollment reason related to coupon codes', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
      userMessage: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED,
      actions: {},
    });
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
        userMessage: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED,
        actions: expect.any(Object),
      },
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('finds applicable coupon code', () => {
    getSubscriptionDisabledEnrollmentReasonType.mockReturnValueOnce(undefined);
    const mockCouponCode = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: dayjs().format('YYYY-MM-DD'),
      couponEndDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    };
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
    findCouponCodeForCourse.mockReturnValueOnce(mockCouponCode);
    useCouponCodes.mockReturnValueOnce({ data: { couponCodeAssignments: [mockCouponCode] } });
    useEnterpriseCustomerContainsContentSuspense.mockReturnValueOnce({ data: { catalogList: [mockCatalogUUID] } });
    useCourseRedemptionEligibility.mockReturnValue({
      data: {
        isPolicyRedemptionEnabled: false,
      },
    });
    const args = {
      ...baseArgs,
      couponCodes: [mockCouponCode],
    };
    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(findCouponCodeForCourse).toHaveBeenCalledWith(args.couponCodes, args.courseData.catalog.catalogList);
    expect(getSubsidyToApplyForCourse).toHaveBeenCalledWith({
      applicableCouponCode: mockCouponCode,
      applicableEnterpriseOffer: undefined,
      applicableSubscriptionLicense: null,
      applicableSubsidyAccessPolicy: {
        isPolicyRedemptionEnabled: false,
        redeemableSubsidyAccessPolicy: null,
        availableCourseRuns: [],
      },
    });

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: COUPON_CODE_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('finds applicable enterprise offer', () => {
    getSubscriptionDisabledEnrollmentReasonType.mockReturnValueOnce(undefined);
    const mockEnterpriseOffer = {
      catalog: mockCatalogUUID,
      code: 'test-coupon-code',
      usageType: 'percentage',
      benefitValue: 100,
      couponStartDate: dayjs().format('YYYY-MM-DD'),
      couponEndDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
    };
    getSubsidyToApplyForCourse.mockReturnValueOnce({
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
    findEnterpriseOfferForCourse.mockReturnValueOnce(mockEnterpriseOffer);

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: expect.objectContaining({
        subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
      }),
      missingUserSubsidyReason: undefined,
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('returns offer error', () => {
    getMissingApplicableSubsidyReason.mockReturnValueOnce({
      reason: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
      userMessage: REASON_USER_MESSAGES.ENTERPRISE_OFFER_EXPIRED,
      actions: null,
    });
    findCouponCodeForCourse.mockReturnValueOnce(undefined);

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current).toEqual({
      userSubsidyApplicableToCourse: undefined,
      missingUserSubsidyReason: {
        reason: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
        userMessage: DISABLED_ENROLL_USER_MESSAGES[DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED],
        actions: null,
      },
      isPending: false,
      canRequestLearnerCredit: false,
      learnerCreditRequestablePolicy: null,
      learnerCreditRequestReason: null,
    });
  });

  it('handles canRequestData for learner credit', () => {
    useCourseCanRequestEligibility.mockReturnValueOnce({
      data: {
        canRequest: true,
        reason: null,
        requestableSubsidyAccessPolicy: {
          uuid: 'test-access-policy-uuid',
          policyRedemptionUrl: 'http://localhost:18270/api/v1/policy-redemption/54d2b522-35e7-47c7-a310-060c63b777ea/redeem/',
          isLateRedemptionAllowed: false,
          policyType: 'PerLearnerSpendCreditAccessPolicy',
          enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
          displayName: 'Per learner spend',
          description: '',
          active: true,
          retired: false,
          retiredAt: null,
          catalogUuid: 'test-catalog-uuid',
          subsidyUuid: 'test-subsidy-uuid',
          accessMethod: 'direct',
          spendLimit: 1000000,
          lateRedemptionAllowedUntil: null,
          perLearnerEnrollmentLimit: null,
          perLearnerSpendLimit: 100000,
          learnerCreditRequestConfig: 'test-learnerCreditRequestConfig-uuid',
          assignmentConfiguration: null,
        },
      },
      isPending: false,
    });

    const { result } = renderHook(() => useUserSubsidyApplicableToCourse());

    expect(result.current.canRequestLearnerCredit).toBe(true);
    expect(result.current.learnerCreditRequestablePolicy).toEqual({
      uuid: 'test-access-policy-uuid',
      policyRedemptionUrl: 'http://localhost:18270/api/v1/policy-redemption/54d2b522-35e7-47c7-a310-060c63b777ea/redeem/',
      isLateRedemptionAllowed: false,
      policyType: 'PerLearnerSpendCreditAccessPolicy',
      enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
      displayName: 'Per learner spend',
      description: '',
      active: true,
      retired: false,
      retiredAt: null,
      catalogUuid: 'test-catalog-uuid',
      subsidyUuid: 'test-subsidy-uuid',
      accessMethod: 'direct',
      spendLimit: 1000000,
      lateRedemptionAllowedUntil: null,
      perLearnerEnrollmentLimit: null,
      perLearnerSpendLimit: 100000,
      learnerCreditRequestConfig: 'test-learnerCreditRequestConfig-uuid',
      assignmentConfiguration: null,
    });
    expect(result.current.learnerCreditRequestReason).toBe(null);
  });
});
