import { renderHook, act } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import camelCase from 'lodash.camelcase';
import dayjs from 'dayjs';
import { Factory } from 'rosie';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../../../../../../utils/tests';
import {
  useContentAssignments,
  useCourseEnrollments,
  useCourseEnrollmentsBySection,
  useCourseUpgradeData,
} from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES } from '../constants';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import { createEnrollWithLicenseUrl, createEnrollWithCouponCodeUrl } from '../../../../../course/data/utils';
import { ASSIGNMENT_TYPES } from '../../../../../enterprise-user-subsidy/enterprise-offers/data/constants';
import {
  emptyRedeemableLearnerCreditPolicies,
  transformCourseEnrollment,
  transformLearnerContentAssignment,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
} from '../../../../../app/data';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useEnterpriseCourseEnrollments: jest.fn(),
}));

const mockCourseService = {
  fetchUserLicenseSubsidy: jest.fn(),
  fetchEnterpriseCustomerContainsContent: jest.fn(),
  fetchCourseRun: jest.fn(),
};

jest.mock('../../../../../course/data/service', () => ({
  __esModule: true,
  default: jest.fn(() => mockCourseService),
}));

const mockRawCourseEnrollment = createRawCourseEnrollment();
const mockTransformedMockCourseEnrollment = transformCourseEnrollment(mockRawCourseEnrollment);

const mockEnterpriseCustomer = Factory.build('enterpriseCustomer');

const mockAppContextValue = {
  authenticatedUser: {
    userId: 3,
  },
};

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    <AppContext.Provider value={mockAppContextValue}>
      {children}
    </AppContext.Provider>
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
    const enterpriseId = 'uuid';
    const subscriptionLicense = { uuid: 'license-uuid' };
    const location = { search: '' };
    const basicArgs = {
      courseRunKey,
      enterpriseId,
      subscriptionLicense,
      couponCodes: [],
      location,
    };

    afterEach(() => jest.clearAllMocks());

    it('should return undefined for upgrade urls if the course is not part of the enterprise catalog', async () => {
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
        { data: { contains_content_items: false } },
      );

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();

      expect(result.current.licenseUpgradeUrl).toBeUndefined();
      expect(result.current.couponUpgradeUrl).toBeUndefined();
      expect(result.current.courseRunPrice).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
    });

    describe('upgradeable via license', () => {
      it('should return a license upgrade url', async () => {
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true } },
        );
        mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
          data: {
            subsidy_id: 'subsidy-id',
          },
        });

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

        expect(result.current.licenseUpgradeUrl).toEqual(createEnrollWithLicenseUrl({
          courseRunKey,
          enterpriseId,
          licenseUUID: subscriptionLicense.uuid,
          location,
        }));
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
      });

      it('should return undefined for licenseUpgradeUrl upgrade url if fetchUserLicenseSubsidy returned undefined', async () => {
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true } },
        );
        mockCourseService.fetchUserLicenseSubsidy.mockResolvedValueOnce({
          data: undefined,
        });

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).toHaveBeenCalledWith(courseRunKey);

        expect(result.current.upgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toBeUndefined();
        expect(result.current.courseRunPrice).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
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
        mockCourseService.fetchEnterpriseCustomerContainsContent.mockResolvedValueOnce(
          { data: { contains_content_items: true, catalog_list: [mockCouponCode.catalog] } },
        );
        const sku = 'ABCDEF';
        const coursePrice = '149.00';

        mockCourseService.fetchCourseRun.mockResolvedValueOnce(
          {
            data: {
              firstEnrollablePaidSeatPrice: coursePrice,
              seats: [
                {
                  type: 'verified',
                  price: coursePrice,
                  sku,
                },
                {
                  type: 'audit',
                  price: '0.00',
                  sku: 'abcdef',
                },
              ],
            },
          },
        );

        const args = {
          ...basicArgs,
          subscriptionLicense: undefined,
          couponCodes: [mockCouponCode],
        };

        const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(args));

        expect(result.current.isLoading).toEqual(true);

        await waitForNextUpdate();

        expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
        expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();
        expect(mockCourseService.fetchCourseRun).toHaveBeenCalledWith(courseRunKey);
        expect(result.current.licenseUpgradeUrl).toBeUndefined();
        expect(result.current.couponUpgradeUrl).toEqual(createEnrollWithCouponCodeUrl({
          courseRunKey,
          sku,
          code: mockCouponCode.code,
          location,
        }));
        expect(result.current.courseRunPrice).toEqual(coursePrice);
        expect(result.current.isLoading).toEqual(false);
      });
    });

    it('should handle errors', async () => {
      const error = Error('Uh oh');
      mockCourseService.fetchEnterpriseCustomerContainsContent.mockRejectedValueOnce(error);

      const { result, waitForNextUpdate } = renderHook(() => useCourseUpgradeData(basicArgs));

      expect(result.current.isLoading).toEqual(true);

      await waitForNextUpdate();

      expect(mockCourseService.fetchEnterpriseCustomerContainsContent).toHaveBeenCalledWith([courseRunKey]);
      expect(mockCourseService.fetchUserLicenseSubsidy).not.toHaveBeenCalled();

      expect(result.current.upgradeUrl).toBeUndefined();
      expect(result.current.isLoading).toEqual(false);
      expect(logger.logError).toHaveBeenCalledWith(error);
    });
  });
});

describe('useContentAssignments', () => {
  const mockRedeemableLearnerCreditPolicies = emptyRedeemableLearnerCreditPolicies;
  const mockSubsidyExpirationDateStr = dayjs().add(1, 'd').toISOString();
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
