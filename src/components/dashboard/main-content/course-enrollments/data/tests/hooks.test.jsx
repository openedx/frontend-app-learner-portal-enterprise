import { renderHook, act } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import camelCase from 'lodash.camelcase';
import dayjs from 'dayjs';
import { QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { queryClient } from '../../../../../../utils/tests';
import {
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
  createEnrollWithLicenseUrl,
  createEnrollWithCouponCodeUrl,
  findHighestLevelSeatSku,
} from '../../../../../course/data/utils';
import { ASSIGNMENT_TYPES } from '../../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  ENROLL_BY_DATE_WARNING_THRESHOLD_DAYS,
  emptyRedeemableLearnerCreditPolicies,
  transformCourseEnrollment,
  transformLearnerContentAssignment,
  useCanUpgradeWithLearnerCredit, useCouponCodes,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useRedeemablePolicies,
  useSubscriptions,
  useCourseRunMetadata, COURSE_MODES_MAP,
} from '../../../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../../app/data/services/data/__factories__';
import { ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY } from '../../../../data/constants';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
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
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

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
    const basicArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
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
    const basicArgs = {
      enterpriseUUID: 'uuid',
      requestedCourseEnrollments: [],
    };
    const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
    await waitForNextUpdate();
    expect(result.current.fetchError).toBe(error);
  });

  describe('updateCourseEnrollmentStatus', () => {
    it('should move a course enrollment to the correct status group', async () => {
      service.fetchEnterpriseCourseEnrollments.mockResolvedValue({ data: [mockRawCourseEnrollment] });
      const basicArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
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
      const basicArgs = {
        enterpriseUUID: 'uuid',
        requestedCourseEnrollments: [],
      };
      const { result, waitForNextUpdate } = renderHook(() => useCourseEnrollments(basicArgs));
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

  describe('useCourseUpgradeData', () => {
    const courseRunKey = 'course-run-key';
    const enterpriseId = mockEnterpriseCustomer.uuid;
    const subscriptionLicense = { uuid: 'license-uuid' };
    const location = { pathname: '/', search: '' };
    const basicArgs = {
      courseRunKey,
    };
    beforeEach(() => {
      jest.clearAllMocks();
      useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
      useSubscriptions.mockReturnValue({
        data: { subscriptionLicense: null },
      });
      useCanUpgradeWithLearnerCredit.mockReturnValue({
        data: { applicableSubsidyAccessPolicy: null },
      });
      useEnterpriseCustomerContainsContent.mockReturnValue({
        data: {
          containsContentItems: false,
          catalogList: [],
        },
      });
      useCouponCodes.mockReturnValue({
        data: {
          applicableCouponCode: null,
        },
      });
      useCourseRunMetadata.mockReturnValue({
        data: null,
      });
    });

    it.each([
      true,
      false])('should return undefined for upgrade urls if the course is and isn\'t part of the subsidies but no subsides exist', (containsContentItems) => {
      useEnterpriseCustomerContainsContent.mockReturnValue({
        data: {
          containsContentItems,
          catalogList: [],
        },
      });

      const { result } = renderHook(() => useCourseUpgradeData(basicArgs), { wrapper });

      expect(result.current.licenseUpgradeUrl).toBeUndefined();
      expect(result.current.couponUpgradeUrl).toBeUndefined();
      expect(result.current.courseRunPrice).toBeUndefined();
      expect(result.current.learnerCreditUpgradeUrl).toBeUndefined();
    });

    describe('upgradeable via license', () => {
      it('should return a license upgrade url', () => {
        useEnterpriseCustomerContainsContent.mockReturnValue({
          data: {
            containsContentItems: true,
            catalogList: [],
          },
        });

        useSubscriptions.mockReturnValue({
          data: {
            subscriptionLicense: {
              uuid: 'license-uuid',
              subscriptionPlan: {
                startDate: dayjs().subtract(10, 'days').toISOString(),
                expirationDate: dayjs().add(10, 'days').toISOString(),
              },
              status: 'activated',
            },
          },
        });

        const { result } = renderHook(() => useCourseUpgradeData({
          ...basicArgs,
          mode: COURSE_MODES_MAP.AUDIT,
        }), { wrapper });

        expect(result.current.licenseUpgradeUrl).toEqual(createEnrollWithLicenseUrl({
          courseRunKey,
          enterpriseId,
          licenseUUID: subscriptionLicense.uuid,
          location,
        }));
        expect(result.current.learnerCreditUpgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toBeUndefined();
      });
    });

    describe('upgradeable via coupon', () => {
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
        useCouponCodes.mockReturnValue({
          data: { applicableCouponCode: mockCouponCode },
        });
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
          ...basicArgs,
          mode: COURSE_MODES_MAP.AUDIT,
        }), { wrapper });

        expect(result.current.licenseUpgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toEqual(createEnrollWithCouponCodeUrl({
          courseRunKey,
          sku,
          code: mockCouponCode.code,
          location,
        }));
        expect(result.current.learnerCreditUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toEqual(coursePrice);
      });
    });

    describe('upgrade via learner credit', () => {
      const mockCourseRunKey = 'course-v1:edX+DemoX+T2024';
      const mockCanUpgradeWithLearnerCredit = {
        contentKey: mockCourseRunKey,
        listPrice: 1,
        redemptions: [],
        hasSuccessfulRedemption: false,
        redeemableSubsidyAccessPolicy: {
          uuid: 'test-access-policy-uuid',
          policyRedemptionUrl: 'https://enterprise-access.stage.edx.org/api/v1/policy-redemption/8c4a92c7-3578-407d-9ba1-9127c4e4cc0b/redeem/',
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
      };
      beforeEach(() => {
        jest.clearAllMocks();
        useCanUpgradeWithLearnerCredit.mockReturnValue({
          data: { applicableSubsidyAccessPolicy: mockCanUpgradeWithLearnerCredit },
        });
      });
      it('should return a learner credit upgrade url', async () => {
        useEnterpriseCustomerContainsContent.mockReturnValue({
          data: {
            containsContentItems: true,
            catalogList: [],
          },
        });
        useCouponCodes.mockReturnValue({
          data: { applicableCouponCode: null },
        });

        const { result } = renderHook(() => useCourseUpgradeData({
          ...basicArgs,
          mode: COURSE_MODES_MAP.AUDIT,
        }), { wrapper });

        expect(result.current.licenseUpgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.learnerCreditUpgradeUrl).toEqual(
          mockCanUpgradeWithLearnerCredit.redeemableSubsidyAccessPolicy.policyRedemptionUrl,
        );
        expect(result.current.courseRunPrice).toBeUndefined();
      });
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

  function mockUseEnterpriseCourseEnrollments(policies) {
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
