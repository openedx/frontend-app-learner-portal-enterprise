import { act, renderHook } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { logInfo } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEventWithDelay } from '@edx/frontend-enterprise-utils';
import camelCase from 'lodash.camelcase';
import dayjs from 'dayjs';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { queryClient } from '../../../../../../utils/tests';
import {
  handleQueriesForUpdatedCourseEnrollmentStatus,
  useContentAssignments,
  useCourseEnrollments,
  useCourseEnrollmentsBySection,
  useCourseUpgradeData,
  useGroupAssociationsAlert,
} from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES, HAS_USER_DISMISSED_NEW_GROUP_ALERT } from '../constants';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import {
  createEnrollWithCouponCodeUrl,
  createEnrollWithLicenseUrl,
  findHighestLevelSeatSku,
} from '../../../../../course/data/utils';
import {
  ASSIGNMENT_TYPES,
  COURSE_MODES_MAP,
  emptyRedeemableLearnerCreditPolicies,
  ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
  isBFFEnabledForEnterpriseCustomer,
  learnerDashboardBFFResponse,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  transformCourseEnrollment,
  transformLearnerContentAssignment,
  useCanUpgradeWithLearnerCredit,
  useCouponCodes,
  useCourseRunMetadata,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useRedeemablePolicies,
  useSubscriptions,
} from '../../../../../app/data';
import {
  authenticatedUserFactory,
  enterpriseCourseEnrollmentFactory,
  enterpriseCustomerFactory,
} from '../../../../../app/data/services/data/__factories__';
import { ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY } from '../../../../data/constants';
import { LICENSE_STATUS } from '../../../../../enterprise-user-subsidy/data/constants';
import { useStatefulEnroll } from '../../../../../stateful-enroll/data';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));
jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEventWithDelay: jest.fn(),
}));
jest.mock('../../../../../stateful-enroll/data', () => ({
  ...jest.requireActual('../../../../../stateful-enroll/data'),
  useStatefulEnroll: jest.fn(),
}));
jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
  useRedeemablePolicies: jest.fn(),
  useSubscriptions: jest.fn(),
  useCouponCodes: jest.fn(),
  useCanUpgradeWithLearnerCredit: jest.fn(),
  useEnterpriseCustomerContainsContent: jest.fn(),
  useCourseRunMetadata: jest.fn(),
  isBFFEnabledForEnterpriseCustomer: jest.fn(),
}));
jest.mock('../../../../../course/data/hooks', () => ({
  ...jest.requireActual('../../../../../course/data/hooks'),
  useOptimizelyEnrollmentClickHandler: jest.fn(),
  useTrackSearchConversionClickHandler: jest.fn(),
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCourseEnrollment = enterpriseCourseEnrollmentFactory();
const mockBFFEnterpriseCourseEnrollments = {
  ...learnerDashboardBFFResponse,
  enterpriseCourseEnrollments: [mockEnterpriseCourseEnrollment],
};

const mockAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    <MemoryRouter>
      <AppContext.Provider value={mockAppContextValue}>
        {children}
      </AppContext.Provider>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('useCourseEnrollments', () => {
  it('should fetch and set course enrollments', async () => {
    service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
    const baseArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(baseArgs));
    await waitForNextUpdate();
    expect(service.fetchEnterpriseCourseEnrollments).toHaveBeenCalled();
    expect(result.current.courseEnrollmentsByStatus).toEqual({
      inProgress: [mockTransformedMockCourseEnrollment],
      upcoming: [],
      completed: [],
      savedForLater: [],
      requested: [],
      assigned: [],
    });
    expect(result.current.fetchError).toBeUndefined();
  });

  it('should set fetchError if an error occurs', async () => {
    const error = Error('something went wrong');
    service.fetchEnterpriseCourseEnrollments.mockRejectedValue(error);
    const baseArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(baseArgs));
    await waitForNextUpdate();
    expect(result.current.fetchError).toBe(error);
  });

  describe('updateCourseEnrollmentStatus', () => {
    it('should move a course enrollment to the correct status group', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const baseArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(baseArgs));
      await waitForNextUpdate();

      act(() => result.current.updateCourseEnrollmentStatus({
        courseRunId: mockRawCourseEnrollment.courseRunId,
        originalStatus: COURSE_STATUSES.inProgress,
        newStatus: COURSE_STATUSES.savedForLater,
        savedForLater: true,
      }));

      expect(result.current.courseEnrollmentsByStatus).toEqual(
        {
          assigned: [],
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [{
            ...mockTransformedMockCourseEnrollment,
            courseRunStatus: COURSE_STATUSES.savedForLater,
            savedForLater: true,
          }],
          requested: [],
        },
      );
    });
  });

  describe('removeCourseEnrollment', () => {
    it('should remove a course enrollment', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const baseArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(baseArgs));
      await waitForNextUpdate();

      expect(result.current.courseEnrollmentsByStatus.inProgress).toHaveLength(1);

      act(() => result.current.removeCourseEnrollment({
        courseRunId: mockRawCourseEnrollment.courseRunId,
        enrollmentType: camelCase(mockRawCourseEnrollment.courseRunStatus),
      }));

      expect(result.current.courseEnrollmentsByStatus).toEqual(
        {
          assigned: [],
          inProgress: [],
          upcoming: [],
          completed: [],
          savedForLater: [],
          requested: [],
        },
      );
    });
  });
});

describe('useCourseUpgradeData', () => {
  const courseRunKey = 'course-run-key';
  const enterpriseId = mockEnterpriseCustomer.uuid;
  const subscriptionLicense = {
    uuid: 'license-uuid',
    status: LICENSE_STATUS.ACTIVATED,
    subscriptionPlan: {
      uuid: 'subscription-plan-uuid',
      startDate: dayjs().subtract(10, 'days').toISOString(),
      endDate: dayjs().add(10, 'days').toISOString(),
      isCurrent: true,
    },
  };
  const realLocation = global.location;
  const location = { pathname: '/', search: '' };
  const baseArgs = {
    courseRunKey,
    mode: COURSE_MODES_MAP.AUDIT,
  };
  const mockStatefulRedeem = jest.fn();

  beforeAll(() => {
    delete global.location;
    global.location = { ...realLocation, assign: jest.fn() };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useSubscriptions.mockReturnValue({ data: null });
    useCanUpgradeWithLearnerCredit.mockReturnValue({
      data: {
        applicableSubsidyAccessPolicy: null,
        listPrice: null,
      },
    });
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems: false,
        catalogList: [],
      },
    });
    useCouponCodes.mockReturnValue({ data: null });
    useCourseRunMetadata.mockReturnValue({ data: null });
    useEnterpriseCourseEnrollments.mockReturnValue({ data: null });
    useStatefulEnroll.mockReturnValue({
      redeem: mockStatefulRedeem,
    });
  });

  afterAll(() => {
    global.location = realLocation;
  });

  it.each([
    true,
    false,
  ])("should return null for upgrade urls if the course isn't contained by the subsidies' catalogs (%s)", (containsContentItems) => {
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems,
        catalogList: [],
      },
    });
    const { result } = renderHook(() => useCourseUpgradeData(baseArgs), { wrapper });
    expect(result.current).toEqual(
      expect.objectContaining({
        courseRunPrice: null,
        subsidyForCourse: null,
        hasUpgradeAndConfirm: false,
        redeem: null,
      }),
    );
  });

  it('should return default values for non-audit course mode', () => {
    const { result } = renderHook(() => useCourseUpgradeData({
      ...baseArgs,
      mode: COURSE_MODES_MAP.VERIFIED,
    }), { wrapper });
    expect(result.current).toEqual(
      expect.objectContaining({
        courseRunPrice: null,
        subsidyForCourse: null,
        hasUpgradeAndConfirm: false,
        redeem: null,
      }),
    );
  });

  it('should return default values for audit without applicable subsidy', () => {
    useEnterpriseCustomerContainsContent.mockReturnValue({
      data: {
        containsContentItems: true,
        catalogList: ['test-catalog-uuid'],
      },
    });
    const { result } = renderHook(() => useCourseUpgradeData(baseArgs), { wrapper });
    expect(result.current).toEqual(
      expect.objectContaining({
        courseRunPrice: null,
        subsidyForCourse: null,
        hasUpgradeAndConfirm: false,
        redeem: null,
      }),
    );
  });

  describe('upgrade via license', () => {
    it.each([
      {
        subscriptionLicenseStatus: LICENSE_STATUS.ACTIVATED,
        isSubscriptionPlanCurrent: true,
      },
      {
        subscriptionLicenseStatus: LICENSE_STATUS.ACTIVATED,
        isSubscriptionPlanCurrent: false,
      },
      {
        subscriptionLicenseStatus: LICENSE_STATUS.REVOKED,
        isSubscriptionPlanCurrent: true,
      },
    ])('should return a license upgrade url (%s)', async ({
      subscriptionLicenseStatus,
      isSubscriptionPlanCurrent,
    }) => {
      const mockSubscriptionLicense = {
        ...subscriptionLicense,
        status: subscriptionLicenseStatus,
        subscriptionPlan: {
          ...subscriptionLicense.subscriptionPlan,
          isCurrent: isSubscriptionPlanCurrent,
        },
      };
      useEnterpriseCustomerContainsContent.mockReturnValue({
        data: {
          containsContentItems: true,
          catalogList: [],
        },
      });
      useSubscriptions.mockReturnValue({ data: mockSubscriptionLicense });

      const { result } = renderHook(() => useCourseUpgradeData({
        ...baseArgs,
        mode: COURSE_MODES_MAP.AUDIT,
      }), { wrapper });

      // Assert the custom `select` transform function was passed and works as expected
      expect(useSubscriptions).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.any(Function),
          enabled: true,
        }),
      );
      const useSubscriptionsSelectFn = useSubscriptions.mock.calls[0][0].select;
      const selectTransformResult = useSubscriptionsSelectFn({ subscriptionLicense: mockSubscriptionLicense });
      if (subscriptionLicenseStatus === LICENSE_STATUS.ACTIVATED && isSubscriptionPlanCurrent) {
        expect(selectTransformResult).toEqual(mockSubscriptionLicense);
      } else {
        expect(selectTransformResult).toBeNull();
      }

      // Assert expected output
      const expectedRedemptionUrl = createEnrollWithLicenseUrl({
        courseRunKey,
        enterpriseId,
        licenseUUID: mockSubscriptionLicense.uuid,
        location,
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          subsidyForCourse: expect.objectContaining({
            redemptionUrl: expectedRedemptionUrl,
          }),
          hasUpgradeAndConfirm: false,
          redeem: expect.any(Function),
        }),
      );
      const redeemFn = result.current.redeem;
      await redeemFn();
      expect(sendEnterpriseTrackEventWithDelay).toHaveBeenCalledWith(
        mockEnterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.course.upgrade_button.subscription_license.clicked',
      );
      expect(global.location.assign).toHaveBeenCalledWith(expectedRedemptionUrl);
    });
  });

  describe('upgrade via coupon', () => {
    const mockCouponCode = {
      code: 'coupon-code',
      catalog: 'catalog-1',
      couponStartDate: dayjs().subtract(1, 'w').toISOString(),
      couponEndDate: dayjs().add(8, 'w').toISOString(),
    };

    it('should return a coupon upgrade url', async () => {
      useEnterpriseCustomerContainsContent.mockReturnValue({
        data: {
          containsContentItems: true,
          catalogList: [mockCouponCode.catalog],
        },
      });
      useCouponCodes.mockReturnValue({ data: mockCouponCode });
      const sku = 'ABCDEF';
      const coursePrice = '149.00';
      useCourseRunMetadata.mockReturnValue({
        data: {
          firstEnrollablePaidSeatPrice: coursePrice,
          sku: findHighestLevelSeatSku([
            {
              type: COURSE_MODES_MAP.VERIFIED,
              price: coursePrice,
              sku,
            },
            {
              type: COURSE_MODES_MAP.AUDIT,
              price: '0.00',
              sku: 'abcdef',
            },
          ]),
        },
      });

      const { result } = renderHook(() => useCourseUpgradeData({
        ...baseArgs,
        mode: COURSE_MODES_MAP.AUDIT,
      }), { wrapper });

      // Assert the custom `select` transform function was passed to useCouponCodes and works as expected
      expect(useCouponCodes).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.any(Function),
          enabled: true,
        }),
      );
      const useCouponCodesSelectFn = useCouponCodes.mock.calls[0][0].select;
      const couponCodesSelectTransformResult = useCouponCodesSelectFn({ couponCodeAssignments: [mockCouponCode] });
      expect(couponCodesSelectTransformResult).toEqual(mockCouponCode);

      // Assert the custom `select` transform function was passed to useCourseRunMetadata and works as expected
      expect(useCourseRunMetadata).toHaveBeenCalledWith(
        courseRunKey,
        expect.objectContaining({
          select: expect.any(Function),
          enabled: true,
        }),
      );
      const useCourseRunMetadataSelectFn = useCourseRunMetadata.mock.calls[0][1].select;
      const mockSKU = 'ABCDEF';
      const mockCourseRun = {
        key: courseRunKey,
        seats: [{
          type: COURSE_MODES_MAP.VERIFIED,
          sku: mockSKU,
        }],
      };
      const courseRunMetadataSelectTransformResult = useCourseRunMetadataSelectFn(mockCourseRun);
      expect(courseRunMetadataSelectTransformResult).toEqual(
        expect.objectContaining({
          ...mockCourseRun,
          sku: mockSKU,
        }),
      );

      // Assert expected output
      const expectedRedemptionUrl = createEnrollWithCouponCodeUrl({
        courseRunKey,
        sku,
        code: mockCouponCode.code,
        location,
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          subsidyForCourse: expect.objectContaining({
            redemptionUrl: expectedRedemptionUrl,
          }),
          courseRunPrice: coursePrice,
          hasUpgradeAndConfirm: true,
          redeem: expect.any(Function),
        }),
      );
      const redeemFn = result.current.redeem;
      await redeemFn();
      expect(sendEnterpriseTrackEventWithDelay).toHaveBeenCalledWith(
        mockEnterpriseCustomer.uuid,
        'edx.ui.enterprise.learner_portal.course.upgrade_button.coupon_code.clicked',
      );
      expect(global.location.assign).toHaveBeenCalledWith(expectedRedemptionUrl);
    });
  });

  describe('upgrade via learner credit', () => {
    const mockCourseRunKey = 'course-v1:edX+DemoX+T2024';
    const mockRedemptionUrl = 'https://enterprise-access.stage.edx.org/api/v1/policy-redemption/8c4a92c7-3578-407d-9ba1-9127c4e4cc0b/redeem/';
    const mockCanUpgradeWithLearnerCredit = {
      contentKey: mockCourseRunKey,
      listPrice: {
        usd: 1,
        usd_cents: 100,
      },
      redemptions: [],
      hasSuccessfulRedemption: false,
      redeemableSubsidyAccessPolicy: {
        uuid: 'test-access-policy-uuid',
        policyRedemptionUrl: mockRedemptionUrl,
        isLateRedemptionAllowed: false,
        policyType: 'PerLearnerSpendCreditAccessPolicy',
        enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
        displayName: 'Learner driven plan --- Open Courses',
        description: 'Initial Policy Display Name: Learner driven plan --- Open Courses, Initial Policy Value: $10,000, Initial Subsidy Value: $260,000',
        active: true,
        retired: false,
        catalogUuid: 'test-catalog-uuid',
        subsidyUuid: 'test-subsidy-uuid',
        accessMethod: 'direct',
        spendLimit: 1000000,
        lateRedemptionAllowedUntil: null,
        perLearnerEnrollmentLimit: null,
        perLearnerSpendLimit: null,
        assignmentConfiguration: null,
      },
      canRedeem: true,
      reasons: [],
      isPolicyRedemptionEnabled: true,
      policyRedemptionUrl: mockRedemptionUrl,
    };
    beforeEach(() => {
      jest.clearAllMocks();
      useCanUpgradeWithLearnerCredit.mockReturnValue({
        data: {
          applicableSubsidyAccessPolicy: {
            ...mockCanUpgradeWithLearnerCredit.redeemableSubsidyAccessPolicy,
            isPolicyRedemptionEnabled: true,
          },
          listPrice: mockCanUpgradeWithLearnerCredit.listPrice.usd,
        },
      });
    });
    it('should return a learner credit upgrade url', async () => {
      useEnterpriseCustomerContainsContent.mockReturnValue({
        data: {
          containsContentItems: true,
          catalogList: [mockCanUpgradeWithLearnerCredit.redeemableSubsidyAccessPolicy.catalogUuid],
        },
      });
      const { result } = renderHook(() => useCourseUpgradeData({
        ...baseArgs,
        mode: COURSE_MODES_MAP.AUDIT,
      }), { wrapper });

      // Assert expected output
      const expectedRedemptionUrl = mockCanUpgradeWithLearnerCredit.redeemableSubsidyAccessPolicy.policyRedemptionUrl;
      expect(result.current).toEqual(
        expect.objectContaining({
          subsidyForCourse: expect.objectContaining({
            redemptionUrl: expectedRedemptionUrl,
          }),
          courseRunPrice: mockCanUpgradeWithLearnerCredit.listPrice.usd,
          hasUpgradeAndConfirm: true,
          redeem: expect.any(Function),
        }),
      );
      const redeemFn = result.current.redeem;
      await redeemFn();
      expect(mockStatefulRedeem).toHaveBeenCalled();
    });
  });
});

describe('useContentAssignments', () => {
  const mockRedeemableLearnerCreditPolicies = emptyRedeemableLearnerCreditPolicies;
  const mockSubsidyExpirationDateStr = dayjs().add(ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS + 1, 'days').toISOString();
  const mockAssignmentConfigurationId = 'test-assignment-configuration-id';
  const mockAssignment = {
    contentKey: 'edX+DemoX',
    contentTitle: 'edX Demo Course',
    subsidyExpirationDate: mockSubsidyExpirationDateStr,
    assignmentConfiguration: mockAssignmentConfigurationId,
    contentMetadata: {
      enrollByDate: dayjs().add(1, 'w').toISOString(),
      partners: [{ name: 'Test Partner' }],
    },
    earliestPossibleExpiration: {
      date: mockSubsidyExpirationDateStr,
      reason: 'subsidy_expired',
    },
    actions: [],
  };
  const mockAllocatedAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid',
    state: ASSIGNMENT_TYPES.ALLOCATED,
  };
  const mockExpiredAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid-2',
    state: ASSIGNMENT_TYPES.EXPIRED,
  };
  const mockCanceledAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid-3',
    state: ASSIGNMENT_TYPES.CANCELED,
    actions: [{
      actionType: ASSIGNMENT_TYPES.CANCELED,
      completedAt: dayjs().subtract(1, 'w').toISOString(),
    }],
  };
  const mockAcceptedAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid-4',
    state: ASSIGNMENT_TYPES.ACCEPTED,
  };
  const mockExpiringAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid-5',
    state: ASSIGNMENT_TYPES.ALLOCATED,
    earliestPossibleExpiration: {
      ...mockAssignment.earliestPossibleExpiration,
      date: dayjs().add(ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS - 1, 'days').toISOString(),
    },
  };
  const mockPoliciesWithAssignments = {
    ...mockRedeemableLearnerCreditPolicies,
    learnerContentAssignments: {
      ...mockRedeemableLearnerCreditPolicies.learnerContentAssignments,
      allocatedAssignments: [mockAllocatedAssignment],
      hasAllocatedAssignments: true,
      acceptedAssignments: [mockAcceptedAssignment],
      hasAcceptedAssignments: true,
      assignmentsForDisplay: [mockAllocatedAssignment],
      hasAssignmentsForDisplay: true,
    },
  };

  function mockUseEnterpriseCourseEnrollments(policies, options = {}) {
    const otherEnrollmentsByStatus = options.otherEnrollmentsByStatus || {};
    useEnterpriseCourseEnrollments.mockReturnValue({
      data: {
        allEnrollmentsByStatus: {
          assigned: {
            ...policies.learnerContentAssignments,
            assignmentsForDisplay: policies
              .learnerContentAssignments
              .assignmentsForDisplay.map((item) => transformLearnerContentAssignment(
                item,
                mockEnterpriseCustomer.slug,
              )),
          },
          inProgress: [],
          ...otherEnrollmentsByStatus,
        },
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('should do nothing if acknowledgeContentAssignments called with unsupported assignment state', async () => {
    mockUseEnterpriseCourseEnrollments(mockPoliciesWithAssignments);
    const { result } = renderHook(
      () => useContentAssignments(),
      { wrapper },
    );
    expect(result.current.handleAcknowledgeAssignments).toBeInstanceOf(Function);
    result.current.handleAcknowledgeAssignments({ assignmentState: 'invalid' });
    expect(logger.logError).toHaveBeenCalledWith('Invalid assignment state (invalid) passed to handleAcknowledgeAssignments.');
    expect(service.acknowledgeContentAssignments).not.toHaveBeenCalled();
  });

  it('should handle dismissal / acknowledgement of cancelled assignments', async () => {
    service.acknowledgeContentAssignments.mockResolvedValue({
      data: {
        acknowledged_assignments: [],
        already_acknowledged_assignments: [],
        unacknowledged_assignments: [],
      },
    });
    const mockPoliciesWithCanceledAssignments = {
      ...mockPoliciesWithAssignments,
      learnerContentAssignments: {
        ...mockPoliciesWithAssignments.learnerContentAssignments,
        canceledAssignments: [mockCanceledAssignment],
        hasCanceledAssignments: true,
        assignmentsForDisplay: [
          ...mockPoliciesWithAssignments.learnerContentAssignments.assignmentsForDisplay,
          mockCanceledAssignment,
        ],
      },
    };
    mockUseEnterpriseCourseEnrollments(mockPoliciesWithCanceledAssignments);
    const { result, waitForNextUpdate } = renderHook(
      () => useContentAssignments(),
      { wrapper },
    );
    const expectedAssignments = [
      {
        uuid: mockAllocatedAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockAllocatedAssignment.earliestPossibleExpiration.date).toISOString(),
        title: mockAllocatedAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
        assignmentConfiguration: mockAllocatedAssignment.assignmentConfiguration,
      },
      {
        uuid: mockCanceledAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockCanceledAssignment.earliestPossibleExpiration.date).toISOString(),
        title: mockCanceledAssignment.contentTitle,
        isCanceledAssignment: true,
        isExpiredAssignment: false,
        assignmentConfiguration: mockCanceledAssignment.assignmentConfiguration,
      },
    ];

    expect(result.current).toEqual(
      expect.objectContaining({
        assignments: expectedAssignments.map((assignment) => expect.objectContaining(assignment)),
        showCanceledAssignmentsAlert: true,
        showExpiredAssignmentsAlert: false,
        handleAcknowledgeAssignments: expect.any(Function),
      }),
    );

    // Dismiss the canceled assignments alert and verify the `credits_available` query cache is invalidated.
    act(() => {
      result.current.handleAcknowledgeAssignments({ assignmentState: ASSIGNMENT_TYPES.CANCELED });
    });
    await waitForNextUpdate();
    expect(service.acknowledgeContentAssignments).toHaveBeenCalledTimes(1);
    expect(service.acknowledgeContentAssignments).toHaveBeenCalledWith({
      assignmentConfigurationId: mockAssignmentConfigurationId,
      assignmentIds: expectedAssignments
        .filter((assignment) => assignment.isCanceledAssignment)
        .map((assignment) => assignment.uuid),
    });
  });

  it('should handle dismissal / acknowledgement of expired assignments', async () => {
    service.acknowledgeContentAssignments.mockReturnValue({
      data: {
        acknowledged_assignments: [],
        already_acknowledged_assignments: [],
        unacknowledged_assignments: [],
      },
    });
    const mockPoliciesWithExpiredAssignments = {
      ...mockPoliciesWithAssignments,
      learnerContentAssignments: {
        ...mockPoliciesWithAssignments.learnerContentAssignments,
        expiredAssignments: [mockExpiredAssignment],
        hasExpiredAssignments: true,
        assignmentsForDisplay: [
          ...mockPoliciesWithAssignments.learnerContentAssignments.assignmentsForDisplay,
          mockExpiredAssignment,
        ],
      },
    };
    mockUseEnterpriseCourseEnrollments(mockPoliciesWithExpiredAssignments);
    const { result, waitForNextUpdate } = renderHook(
      () => useContentAssignments(),
      { wrapper },
    );
    const expectedAssignments = [
      {
        uuid: mockAllocatedAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockAllocatedAssignment.earliestPossibleExpiration.date).toISOString(),
        title: mockAllocatedAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
        assignmentConfiguration: mockAllocatedAssignment.assignmentConfiguration,
      },
      {
        uuid: mockExpiredAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockExpiredAssignment.earliestPossibleExpiration.date).toISOString(),
        title: mockExpiredAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: true,
        assignmentConfiguration: mockExpiredAssignment.assignmentConfiguration,
      },
    ];
    expect(result.current).toEqual(
      expect.objectContaining({
        assignments: expectedAssignments.map((assignment) => expect.objectContaining(assignment)),
        showExpiredAssignmentsAlert: true,
        handleAcknowledgeAssignments: expect.any(Function),
      }),
    );

    // Dismiss the expired assignments alert and verify that the `credits_available` query cache is invalidated.
    act(() => {
      result.current.handleAcknowledgeAssignments({ assignmentState: ASSIGNMENT_TYPES.EXPIRED });
    });
    await waitForNextUpdate();
    expect(service.acknowledgeContentAssignments).toHaveBeenCalledTimes(1);
    expect(service.acknowledgeContentAssignments).toHaveBeenCalledWith({
      assignmentConfigurationId: mockAssignmentConfigurationId,
      assignmentIds: expectedAssignments
        .filter((assignment) => assignment.isExpiredAssignment)
        .map((assignment) => assignment.uuid),
    });
  });

  it('should handle dismissal / acknowledgement of expiring assignments', async () => {
    const mockPoliciesWithExpiringAssignments = {
      ...mockPoliciesWithAssignments,
      learnerContentAssignments: {
        ...mockPoliciesWithAssignments.learnerContentAssignments,
        assignmentsForDisplay: [
          ...mockPoliciesWithAssignments.learnerContentAssignments.assignmentsForDisplay,
          mockExpiringAssignment,
        ],
      },
    };
    mockUseEnterpriseCourseEnrollments(mockPoliciesWithExpiringAssignments);
    const { result } = renderHook(() => useContentAssignments(), { wrapper });
    const expectedAssignments = [
      {
        uuid: mockExpiringAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: mockExpiringAssignment.earliestPossibleExpiration.date,
        title: mockExpiringAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
        isExpiringAssignment: true,
        assignmentConfiguration: mockExpiringAssignment.assignmentConfiguration,
      },
      {
        uuid: mockAllocatedAssignment.uuid,
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: mockAllocatedAssignment.earliestPossibleExpiration.date,
        title: mockAllocatedAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
        isExpiringAssignment: false,
        assignmentConfiguration: mockAllocatedAssignment.assignmentConfiguration,
      },
    ];
    expect(result.current).toEqual(
      expect.objectContaining({
        assignments: expectedAssignments.map((assignment) => expect.objectContaining(assignment)),
        showExpiringAssignmentsAlert: true,
        handleAcknowledgeExpiringAssignments: expect.any(Function),
      }),
    );
    expect(global.localStorage.getItem(ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY)).toBeNull();

    // Dismiss the expiring assignments alert and verify that localStorage is correctly updated.
    act(() => {
      result.current.handleAcknowledgeExpiringAssignments();
    });
    const acknowledgedExpiringAssignments = JSON.parse(
      global.localStorage.getItem(ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY),
    );
    expect(acknowledgedExpiringAssignments).toEqual([mockExpiringAssignment.uuid]);
    expect(result.current.showExpiringAssignmentsAlert).toBe(false);
  });

  it.each([
    // Audit, no enrollBy date
    {
      mode: COURSE_MODES_MAP.AUDIT,
      enrollBy: undefined,
      isAssignmentExcluded: true,
    },
    // Audit, with elapsed enrollBy date
    {
      mode: COURSE_MODES_MAP.AUDIT,
      enrollBy: dayjs().subtract(1, 'd').toISOString(), // yesterday
      isAssignmentExcluded: false,
    },
    // Audit, with not-yet-elapsed enrollBy date
    {
      mode: COURSE_MODES_MAP.AUDIT,
      enrollBy: dayjs().add(1, 'd').toISOString(), // tomorrow
      isAssignmentExcluded: true,
    },
    // Verified, no enrollBy date
    {
      mode: COURSE_MODES_MAP.VERIFIED,
      enrollBy: undefined,
      isAssignmentExcluded: false,
    },
    // Verified, with elapsed enrollBy date
    {
      mode: COURSE_MODES_MAP.VERIFIED,
      enrollBy: dayjs().subtract(1, 'd').toISOString(), // yesterday
      isAssignmentExcluded: false,
    },
    // Verified, with not-yet-elapsed enrollBy date
    {
      mode: COURSE_MODES_MAP.VERIFIED,
      enrollBy: dayjs().add(1, 'd').toISOString(), // tomorrow
      isAssignmentExcluded: false,
    },
  ])('should exclude assignments that have an upgradeable in-progress course enrollment (%s)', ({
    mode,
    enrollBy,
    isAssignmentExcluded,
  }) => {
    const mockEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      mode,
      enrollBy,
    };
    const mockAssignmentForExistingEnrollment = {
      ...mockAllocatedAssignment,
      contentKey: mockEnrollment.courseRunKey,
    };
    const mockPoliciesWithInProgressEnrollment = {
      ...mockPoliciesWithAssignments,
      learnerContentAssignments: {
        ...mockPoliciesWithAssignments.learnerContentAssignments,
        assignmentsForDisplay: [
          mockAssignmentForExistingEnrollment,
        ],
      },
    };
    mockUseEnterpriseCourseEnrollments(mockPoliciesWithInProgressEnrollment, {
      otherEnrollmentsByStatus: {
        inProgress: [mockEnrollment],
      },
    });
    const { result } = renderHook(() => useContentAssignments(), { wrapper });
    if (isAssignmentExcluded) {
      expect(result.current.assignments).toHaveLength(0);
    } else {
      expect(result.current.assignments).toHaveLength(1);
    }
  });
});

describe('useCourseEnrollmentsBySection', () => {
  it('returns enrollments by section', () => {
    const mockInProgressEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      courseRunStatus: COURSE_STATUSES.inProgress,
    };
    const mockCompletedEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      courseRunStatus: COURSE_STATUSES.completed,
    };
    const mockUpcomingEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      courseRunStatus: COURSE_STATUSES.upcoming,
    };
    const mockCourseEnrollmentsByStatus = {
      inProgress: [mockInProgressEnrollment],
      upcoming: [mockUpcomingEnrollment],
      completed: [mockCompletedEnrollment],
      savedForLater: [],
      requested: [],
      assigned: {
        assignmentsForDisplay: [],
      },
    };
    const { result } = renderHook(() => useCourseEnrollmentsBySection(mockCourseEnrollmentsByStatus));
    expect(result.current).toEqual({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [mockInProgressEnrollment, mockUpcomingEnrollment],
      completedCourseEnrollments: [mockCompletedEnrollment],
      savedForLaterCourseEnrollments: [],
    });
  });

  it('returns hasCourseEnrollments as true if there are assignments with no enrollments', () => {
    const mockAssignedEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      courseRunStatus: COURSE_STATUSES.assigned,
    };
    const mockCourseEnrollmentsByStatus = {
      inProgress: [],
      upcoming: [],
      completed: [],
      savedForLater: [],
      requested: [],
      assigned: {
        assignmentsForDisplay: [mockAssignedEnrollment],
      },
    };
    const { result } = renderHook(() => useCourseEnrollmentsBySection(mockCourseEnrollmentsByStatus));
    expect(result.current).toEqual({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [],
      completedCourseEnrollments: [],
      savedForLaterCourseEnrollments: [],
    });
  });

  it('returns hasCourseEnrollments as false if there are no assignments or enrollments', () => {
    const mockCourseEnrollmentsByStatus = {
      inProgress: [],
      upcoming: [],
      completed: [],
      savedForLater: [],
      requested: [],
      assigned: {
        assignmentsForDisplay: [],
      },
    };
    const { result } = renderHook(() => useCourseEnrollmentsBySection(mockCourseEnrollmentsByStatus));
    expect(result.current).toEqual({
      hasCourseEnrollments: false,
      currentCourseEnrollments: [],
      completedCourseEnrollments: [],
      savedForLaterCourseEnrollments: [],
    });
  });
});

describe('useGroupAssociationsAlert', () => {
  it('returns expected values', async () => {
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useRedeemablePolicies.mockReturnValue({
      data: {
        redeemablePolicies: [{
          groupAssociations: ['test-group-uuid-1'],
        },
        {
          groupAssociations: ['test-group-uuid-2'],
        }],
      },
    });

    const { result } = renderHook(
      () => useGroupAssociationsAlert(),
      { wrapper },
    );
    expect(result.current).toEqual({
      showNewGroupAssociationAlert: true,
      dismissGroupAssociationAlert: expect.any(Function),
      enterpriseCustomer: mockEnterpriseCustomer,
    });
    expect(result.current.dismissGroupAssociationAlert).toBeInstanceOf(Function);
    act(() => result.current.dismissGroupAssociationAlert());
    const localStorageGroup1 = global.localStorage.getItem(
      `${HAS_USER_DISMISSED_NEW_GROUP_ALERT}-test-group-uuid-1`,
    );
    // checks that a second local storage key is added
    const localStorageGroup2 = global.localStorage.getItem(
      `${HAS_USER_DISMISSED_NEW_GROUP_ALERT}-test-group-uuid-2`,
    );
    await waitFor(() => {
      expect(localStorageGroup1).toBe('true');
      expect(localStorageGroup2).toBe('true');
    });
  });
});

describe('handleQueriesForUpdatedCourseEnrollmentStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it.each([
    // BFF enabled
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: true,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: true,
    },
    // BFF disabled
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: mockBFFEnterpriseCourseEnrollments,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: mockEnterpriseCourseEnrollment,
      isBFFEnabled: false,
    },
    {
      bffEnterpriseCourseEnrollmentsData: null,
      enterpriseCourseEnrollmentsData: null,
      isBFFEnabled: false,
    },
  ])('updates the status, (%s)', (
    {
      bffEnterpriseCourseEnrollmentsData,
      enterpriseCourseEnrollmentsData,
      isBFFEnabled,
    },
  ) => {
    // Define parameters
    let mockQueryClient;
    isBFFEnabledForEnterpriseCustomer.mockReturnValue(isBFFEnabled);
    const mockParams = { enterpriseSlug: 'test-enterprise-slug' };
    const mockCourseRunId = mockEnterpriseCourseEnrollment.courseRunId;
    const newEnrollmentStatus = 'saved_for_later';

    // Create a mock hook to utilize queryClient
    const useMockHook = () => {
      mockQueryClient = useQueryClient();
      if (bffEnterpriseCourseEnrollmentsData) {
        mockQueryClient.setQueryData(
          queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockParams.enterpriseSlug }).queryKey,
          bffEnterpriseCourseEnrollmentsData,
        );
      }
      if (enterpriseCourseEnrollmentsData) {
        mockQueryClient.setQueryData(
          queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
          [enterpriseCourseEnrollmentsData],
        );
      }
      return handleQueriesForUpdatedCourseEnrollmentStatus({
        queryClient: mockQueryClient,
        enterpriseSlug: mockParams.enterpriseSlug,
        enterpriseCustomer: mockEnterpriseCustomer,
        courseRunId: mockCourseRunId,
        newEnrollmentStatus,
      });
    };

    // Validate initial courseRunStatus as `in_progress`
    expect(mockEnterpriseCourseEnrollment.courseRunStatus).toEqual('in_progress');

    // Render hook
    renderHook(
      () => useMockHook(),
      { wrapper },
    );

    // Determine if course run status gets modified based on parameters
    let updatedEnrollments;
    let updatedMockedEnrollment;
    if (isBFFEnabled) {
      updatedEnrollments = mockQueryClient.getQueryData(
        queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: 'test-enterprise-slug' }).queryKey,
      );
      updatedMockedEnrollment = updatedEnrollments?.enterpriseCourseEnrollments.find(
        enrollment => enrollment.courseRunId === mockCourseRunId,
      );
      if (bffEnterpriseCourseEnrollmentsData && !enterpriseCourseEnrollmentsData) {
        expect(updatedMockedEnrollment.courseRunStatus).toEqual(newEnrollmentStatus);
        expect(logInfo).toHaveBeenCalledTimes(0);
      } else if (!bffEnterpriseCourseEnrollmentsData) {
        expect(updatedMockedEnrollment).toEqual(undefined);
        expect(logInfo).toHaveBeenCalledTimes(1);
      } else {
        expect(updatedMockedEnrollment.courseRunStatus).toEqual(newEnrollmentStatus);
        expect(logInfo).toHaveBeenCalledTimes(0);
      }
    }
    if (!isBFFEnabled) {
      updatedEnrollments = mockQueryClient.getQueryData(
        queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
      );
      updatedMockedEnrollment = updatedEnrollments?.find(enrollment => enrollment.courseRunId === mockCourseRunId);
      if (enterpriseCourseEnrollmentsData && !bffEnterpriseCourseEnrollmentsData) {
        expect(updatedMockedEnrollment.courseRunStatus).toEqual(newEnrollmentStatus);
        expect(logInfo).toHaveBeenCalledTimes(0);
      } else if (!enterpriseCourseEnrollmentsData) {
        expect(updatedMockedEnrollment).toEqual(undefined);
        expect(logInfo).toHaveBeenCalledTimes(1);
      } else {
        expect(updatedMockedEnrollment.courseRunStatus).toEqual(newEnrollmentStatus);
        expect(logInfo).toHaveBeenCalledTimes(0);
      }
    }
  });
});
