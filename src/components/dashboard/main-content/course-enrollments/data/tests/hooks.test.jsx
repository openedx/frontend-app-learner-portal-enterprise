import { renderHook, act } from '@testing-library/react-hooks';
import * as logger from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import camelCase from 'lodash.camelcase';
import dayjs from 'dayjs';

import {
  useContentAssignments,
  useCourseEnrollments,
  useCourseEnrollmentsBySection,
  useCourseUpgradeData,
} from '../hooks';
import * as service from '../service';
import { COURSE_STATUSES, LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT, LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT } from '../constants';
import { transformCourseEnrollment } from '../utils';
import { createRawCourseEnrollment } from '../../tests/enrollment-testutils';
import { createEnrollWithLicenseUrl, createEnrollWithCouponCodeUrl } from '../../../../../course/data/utils';
import { ASSIGNMENT_ACTION_TYPES, ASSIGNMENT_TYPES } from '../../../../../enterprise-user-subsidy/enterprise-offers/data/constants';

jest.mock('../service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
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
  const mockAppContextValue = {
    enterpriseConfig: {
      slug: 'test-enterprise',
    },
  };
  const wrapper = ({ children }) => (
    <AppContext.Provider value={mockAppContextValue}>
      {children}
    </AppContext.Provider>
  );
  const mockRedeemableLearnerCreditPolicies = {
    redeemablePolicies: [],
    learnerContentAssignments: {
      assignments: [],
      hasAssignments: false,
      allocatedAssignments: [],
      hasAllocatedAssignments: false,
      canceledAssignments: [],
      hasCanceledAssignments: false,
      acceptedAssignments: [],
      hasAcceptedAssignments: false,
      erroredAssignments: [],
      hasErroredAssignments: false,
    },
  };
  const mockAssignment = {
    contentKey: 'edX+DemoX',
    contentTitle: 'edX Demo Course',
    contentMetadata: {
      enrollByDate: dayjs().add(1, 'd').toISOString(),
      partners: [{ name: 'Test Partner' }],
    },
    actions: [],
  };
  const mockAllocatedAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid',
    state: ASSIGNMENT_TYPES.ALLOCATED,
  };
  const mockAllocatedExpiredAssignment = {
    ...mockAllocatedAssignment,
    uuid: 'test-assignment-uuid-2',
    contentMetadata: {
      ...mockAllocatedAssignment.contentMetadata,
      enrollByDate: dayjs().subtract(1, 'w').toISOString(),
    },
  };
  const mockCanceledAssignment = {
    ...mockAssignment,
    uuid: 'test-assignment-uuid-3',
    state: ASSIGNMENT_TYPES.CANCELED,
    actions: [{
      actionType: ASSIGNMENT_ACTION_TYPES.CANCELED,
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
      canceledAssignments: [mockCanceledAssignment],
      hasCanceledAssignments: true,
      acceptedAssignments: [mockAcceptedAssignment],
      hasAcceptedAssignments: true,
    },
  };

  afterEach(() => {
    window.localStorage.removeItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT);
    window.localStorage.removeItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT);
  });

  it.each([
    { hasDismissedCanceledAssignmentsAlert: false },
    { hasDismissedCanceledAssignmentsAlert: true },
  ])('should return only allocated and canceled assignments, handling dismiss behavior (%s)', async ({
    hasDismissedCanceledAssignmentsAlert,
  }) => {
    if (hasDismissedCanceledAssignmentsAlert) {
      window.localStorage.setItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT, new Date());
    }
    const { result } = renderHook(
      () => useContentAssignments(mockPoliciesWithAssignments),
      { wrapper },
    );
    const expectedAssignments = [
      {
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockAllocatedAssignment.contentMetadata.enrollByDate).toDate(),
        title: mockAllocatedAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
      },
    ];
    if (!hasDismissedCanceledAssignmentsAlert) {
      expectedAssignments.push({
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockCanceledAssignment.contentMetadata.enrollByDate).toDate(),
        title: mockCanceledAssignment.contentTitle,
        isCanceledAssignment: true,
        isExpiredAssignment: false,
      });
    }
    expect(result.current).toEqual(
      expect.objectContaining({
        assignments: expectedAssignments.map((assignment) => expect.objectContaining(assignment)),
        showCanceledAssignmentsAlert: !hasDismissedCanceledAssignmentsAlert,
        showExpiredAssignmentsAlert: false,
        handleOnCloseCancelAlert: expect.any(Function),
        handleOnCloseExpiredAlert: expect.any(Function),
      }),
    );

    // If canceled assignments have not yet been dismissed/acknowledged, then
    // dismiss the canceled assignments alert and verify that the canceled
    // assignments are no longer returned.
    if (!hasDismissedCanceledAssignmentsAlert) {
      act(() => result.current.handleOnCloseCancelAlert());
      expect(window.localStorage.getItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_CANCELLATION_ALERT)).toBeTruthy();
      expect(result.current).toEqual(
        expect.objectContaining({
          assignments: expectedAssignments
            .filter((assignment) => !assignment.isCanceledAssignment)
            .map((assignment) => expect.objectContaining(assignment)),
          showCanceledAssignmentsAlert: false,
        }),
      );
    }
  });

  it.each([
    { hasDismissedExpiredAssignmentsAlert: false },
    { hasDismissedExpiredAssignmentsAlert: true },
  ])('should return only allocated and expired assignments, handling dismiss behavior (%s)', async ({
    hasDismissedExpiredAssignmentsAlert,
  }) => {
    const mockPoliciesWithExpiredAssignments = {
      ...mockPoliciesWithAssignments,
      learnerContentAssignments: {
        ...mockPoliciesWithAssignments.learnerContentAssignments,
        allocatedAssignments: [mockAllocatedAssignment, mockAllocatedExpiredAssignment],
        canceledAssignments: [],
        hasCanceledAssignments: false,
      },
    };
    if (hasDismissedExpiredAssignmentsAlert) {
      window.localStorage.setItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT, new Date());
    }
    const { result } = renderHook(
      () => useContentAssignments(mockPoliciesWithExpiredAssignments),
      { wrapper },
    );
    const expectedAssignments = [
      {
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockAllocatedAssignment.contentMetadata.enrollByDate).toDate(),
        title: mockAllocatedAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: false,
      },
    ];
    if (!hasDismissedExpiredAssignmentsAlert) {
      expectedAssignments.push({
        courseRunStatus: COURSE_STATUSES.assigned,
        enrollBy: dayjs(mockAllocatedExpiredAssignment.contentMetadata.enrollByDate).toDate(),
        title: mockAllocatedExpiredAssignment.contentTitle,
        isCanceledAssignment: false,
        isExpiredAssignment: true,
      });
    }
    expect(result.current).toEqual(
      expect.objectContaining({
        assignments: expectedAssignments.map((assignment) => expect.objectContaining(assignment)),
        showExpiredAssignmentsAlert: !hasDismissedExpiredAssignmentsAlert,
        handleOnCloseCancelAlert: expect.any(Function),
        handleOnCloseExpiredAlert: expect.any(Function),
      }),
    );

    // If expired assignments have not yet been dismissed/acknowledged, then
    // dismiss the expired assignments alert and verify that the expired
    // assignments are no longer returned.
    if (!hasDismissedExpiredAssignmentsAlert) {
      act(() => result.current.handleOnCloseExpiredAlert());
      expect(window.localStorage.getItem(LEARNER_ACKNOWLEDGED_ASSIGNMENT_EXPIRATION_ALERT)).toBeTruthy();
      expect(result.current).toEqual(
        expect.objectContaining({
          assignments: expectedAssignments
            .filter((assignment) => !assignment.isExpiredAssignment)
            .map((assignment) => expect.objectContaining(assignment)),
          showExpiredAssignmentsAlert: false,
        }),
      );
    }
  });
});

describe('useCourseEnrollmentsBySection', () => {
  it('returns enrollments, if any, by section and accounting for any accepted assignments', () => {
    const mockAssignedContentKey = 'edX+DemoX';
    const mockAssignments = [{
      state: ASSIGNMENT_TYPES.ACCEPTED,
      contentKey: mockAssignedContentKey,
    }];
    const mockAssignedEnrollment = {
      ...mockTransformedMockCourseEnrollment,
      courseRunId: mockAssignedContentKey,
      courseRunStatus: COURSE_STATUSES.assigned,
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
      inProgress: [mockAssignedEnrollment],
      upcoming: [mockUpcomingEnrollment],
      completed: [mockCompletedEnrollment],
      savedForLater: [],
      requested: [],
      assigned: [],
    };
    const { result } = renderHook(() => useCourseEnrollmentsBySection({
      assignments: mockAssignments,
      courseEnrollmentsByStatus: mockCourseEnrollmentsByStatus,
    }));
    const mockTransformedAcceptedAssignment = {
      ...mockAssignedEnrollment,
      isCourseAssigned: true,
    };
    expect(result.current).toEqual({
      hasCourseEnrollments: true,
      currentCourseEnrollments: [mockTransformedAcceptedAssignment, mockUpcomingEnrollment],
      completedCourseEnrollments: [mockCompletedEnrollment],
      savedForLaterCourseEnrollments: [],
    });
  });
});
