import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import {
  fetchBrowseAndRequestConfiguration,
  fetchCouponCodeRequests,
  fetchEnterpriseCourseEnrollments,
  fetchLicenseRequests,
  fetchRedeemablePolicies,
} from '../services';
import useEnterpriseCourseEnrollments from './useEnterpriseCourseEnrollments';
import { COURSE_STATUSES } from '../../../../constants';
import { useSuspenseBFF } from './useBFF';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseCourseEnrollments: jest.fn().mockResolvedValue(null),
  fetchBrowseAndRequestConfiguration: jest.fn().mockResolvedValue(null),
  fetchLicenseRequests: jest.fn().mockResolvedValue(null),
  fetchCouponCodeRequests: jest.fn().mockResolvedValue(null),
  fetchRedeemablePolicies: jest.fn().mockResolvedValue(null),
}));
jest.mock('./useBFF');

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockCourseEnrollment = {
  courseRunId: 'test-course-run-id',
  courseRunStatus: COURSE_STATUSES.inProgress,
  courseKey: 'test-course-key',
  displayName: 'Education',
  micromastersTitle: 'Demo in higher education',
  courseRunUrl: 'test-course-url',
  certificateDownloadUrl: null,
  emailsEnabled: false,
  dueDates: [],
};
const mockTransformedCourseEnrollment = {
  courseRunId: mockCourseEnrollment.courseRunId,
  courseRunStatus: mockCourseEnrollment.courseRunStatus,
  courseKey: mockCourseEnrollment.courseKey,
  title: mockCourseEnrollment.displayName,
  micromastersTitle: mockCourseEnrollment.micromastersTitle,
  linkToCourse: mockCourseEnrollment.courseRunUrl,
  linkToCertificate: mockCourseEnrollment.certificateDownloadUrl,
  hasEmailsEnabled: mockCourseEnrollment.emailsEnabled,
  notifications: mockCourseEnrollment.dueDates,
  canUnenroll: true,
};
const mockBrowseAndRequestConfiguration = {
  id: 123,
};
const mockLicenseRequest = {
  courseId: 'test-course-id-1',
  courseTitle: 'Test Course Title 1',
  coursePartners: [{ name: 'edx' }],
  created: true,
};
const mockCouponCodeRequest = {
  courseId: 'test-course-id-2',
  courseTitle: 'Test Course Title 2',
  coursePartners: [{ name: 'edx' }, { name: '2U' }],
  created: true,
};
const mockSubsidyExpirationDate = dayjs().add(1, 'year').toISOString();
const mockContentAssignment = {
  uuid: 'test-assignment-uuid',
  state: 'allocated',
  earliestPossibleExpiration: {
    date: dayjs().add(25, 'days').toISOString(),
  },
  contentKey: 'edX+DemoX',
  contentTitle: 'Test Content Title 1',
  contentMetadata: {
    startDate: dayjs().add(25, 'days').toISOString(),
    endDate: dayjs().add(65, 'days').toISOString(),
    mode: 'test-mode',
    partners: [{ name: 'edx' }],
  },
  assignmentConfiguration: 'test-configuration',
  learnerAcknowledged: true,
  isAssignedCourseRun: false,
};
const redeemablePolicies = [
  {
    id: 123,
    subsidyExpirationDate: mockSubsidyExpirationDate,
  },
  {
    id: 456,
    subsidyExpirationDate: mockSubsidyExpirationDate,
    learnerContentAssignments: [mockContentAssignment],
  },
];
const expectedTransformedPolicies = redeemablePolicies.map((policy) => ({
  ...policy,
  learnerContentAssignments: policy.learnerContentAssignments?.map((assignment) => ({
    ...assignment,
    subsidyExpirationDate: policy.subsidyExpirationDate,
  })),
}));
const mockContentAssignmentWithSubsidyExpiration = {
  ...mockContentAssignment,
  subsidyExpirationDate: mockSubsidyExpirationDate,
};
const mockRedeemablePolicies = {
  redeemablePolicies: expectedTransformedPolicies,
  learnerContentAssignments: {
    acceptedAssignments: [],
    allocatedAssignments: [mockContentAssignmentWithSubsidyExpiration],
    assignments: [mockContentAssignmentWithSubsidyExpiration],
    assignmentsForDisplay: [mockContentAssignmentWithSubsidyExpiration],
    canceledAssignments: [],
    erroredAssignments: [],
    expiredAssignments: [],
    hasAcceptedAssignments: false,
    hasAllocatedAssignments: true,
    hasAssignments: true,
    hasAssignmentsForDisplay: true,
    hasCanceledAssignments: false,
    hasErroredAssignments: false,
    hasExpiredAssignments: false,

  },
};

const expectedTransformedRequest = (request) => ({
  courseRunId: request.courseId,
  title: request.courseTitle,
  orgName: request.coursePartners?.map(partner => partner.name).join(', '),
  courseRunStatus: COURSE_STATUSES.requested,
  linkToCourse: `${mockEnterpriseCustomer.slug}/course/${request.courseId}`,
  created: request.created,
  notifications: [],
});

describe('useEnterpriseCourseEnrollments', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          {children}
        </AppContext.Provider>
      </Suspense>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCourseEnrollments.mockResolvedValue([mockCourseEnrollment]);
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue([mockLicenseRequest]);
    fetchCouponCodeRequests.mockResolvedValue([mockCouponCodeRequest]);
    fetchRedeemablePolicies.mockResolvedValue(mockRedeemablePolicies);
    useSuspenseBFF.mockReturnValue({
      data: {
        enrollments: [mockTransformedCourseEnrollment],
        enrollmentsByStatus: {
          [COURSE_STATUSES.inProgress]: [mockTransformedCourseEnrollment],
          [COURSE_STATUSES.upcoming]: [],
          [COURSE_STATUSES.completed]: [],
          [COURSE_STATUSES.savedForLater]: [],
        },
      },
    });
  });

  it.each([
    { hasQueryOptions: false },
    { hasQueryOptions: true },
  ])('should return transformed enrollments data (%s)', async ({ hasQueryOptions }) => {
    const expectedEnterpriseCourseEnrollmentsData = {
      enrollments: [mockTransformedCourseEnrollment],
      enrollmentsByStatus: {
        inProgress: [mockTransformedCourseEnrollment],
        upcoming: [],
        completed: [],
        savedForLater: [],
        approved: [],
        lcRequested: [],
      },
    };
    const expectedRequests = {
      couponCodes: [expectedTransformedRequest(mockCouponCodeRequest)],
      subscriptionLicenses: [expectedTransformedRequest(mockLicenseRequest)],
    };
    const expectedTransformedLearnerContentAssignment = {
      linkToCourse: `/${mockEnterpriseCustomer.slug}/course/${mockContentAssignment.contentKey}`,
      courseRunId: mockContentAssignment.contentKey,
      title: mockContentAssignment.contentTitle,
      isRevoked: false,
      notifications: [],
      courseRunStatus: COURSE_STATUSES.assigned,
      endDate: mockContentAssignment.contentMetadata?.endDate,
      startDate: mockContentAssignment.contentMetadata?.startDate,
      mode: mockContentAssignment.contentMetadata?.courseType,
      orgName: mockContentAssignment.contentMetadata?.partners[0]?.name,
      enrollBy: mockContentAssignment.earliestPossibleExpiration.date,
      isCanceledAssignment: false,
      isExpiredAssignment: false,
      isExpiringAssignment: false,
      assignmentConfiguration: mockContentAssignment.assignmentConfiguration,
      uuid: mockContentAssignment.uuid,
      learnerAcknowledged: mockContentAssignment.learnerAcknowledged,
      isAssignedCourseRun: mockContentAssignment.isAssignedCourseRun,
    };
    const expectedContentAssignmentData = {
      acceptedAssignments: [],
      allocatedAssignments: [expectedTransformedLearnerContentAssignment],
      assignmentsForDisplay: [expectedTransformedLearnerContentAssignment],
      assignments: [expectedTransformedLearnerContentAssignment],
      canceledAssignments: [],
      erroredAssignments: [],
      expiredAssignments: [],
    };
    const expectedTransformedAllEnrollmentsByStatus = {
      [COURSE_STATUSES.inProgress]: (
        expectedEnterpriseCourseEnrollmentsData.enrollmentsByStatus[COURSE_STATUSES.inProgress]
      ),
      [COURSE_STATUSES.upcoming]: [],
      [COURSE_STATUSES.completed]: [],
      [COURSE_STATUSES.savedForLater]: [],
      [COURSE_STATUSES.requested]: [mockLicenseRequest, mockCouponCodeRequest],
      [COURSE_STATUSES.assigned]: expect.objectContaining({
        allocatedAssignments: [mockContentAssignment],
      }),
    };

    const mockSelectEnrollment = jest.fn().mockReturnValue(expectedEnterpriseCourseEnrollmentsData);
    const mockSelectLicenseRequest = jest.fn().mockReturnValue(expectedRequests.subscriptionLicenses);
    const mockSelectCouponCodeRequest = jest.fn().mockReturnValue(expectedRequests.couponCodes);
    const mockSelectContentAssignment = jest.fn().mockReturnValue(expectedContentAssignmentData);
    const mockQueryOptions = {
      enrollmentQueryOptions: { select: mockSelectEnrollment },
      licenseRequestQueryOptions: { select: mockSelectLicenseRequest },
      couponCodeRequestQueryOptions: { select: mockSelectCouponCodeRequest },
      contentAssignmentQueryOptions: { select: mockSelectContentAssignment },
    };
    const queryOptions = hasQueryOptions ? mockQueryOptions : undefined;
    const { result } = renderHook(
      () => {
        if (hasQueryOptions) {
          return useEnterpriseCourseEnrollments(queryOptions);
        }
        return useEnterpriseCourseEnrollments();
      },
      { wrapper: Wrapper },
    );

    // Call the useSuspenseBFF's select functions
    const useSuspenseBFFArgs = useSuspenseBFF.mock.calls[0][0];
    const { select: selectBFFQuery } = useSuspenseBFFArgs.bffQueryOptions;
    const { select: selectFallbackBFFQuery } = useSuspenseBFFArgs.fallbackQueryConfig;
    selectBFFQuery({
      enterpriseCourseEnrollments: expectedEnterpriseCourseEnrollmentsData.enrollments,
      allEnrollmentsByStatus: expectedEnterpriseCourseEnrollmentsData.enrollmentsByStatus,
    });
    selectFallbackBFFQuery([mockCourseEnrollment]);

    // Assert that passed select fn query options were called with the correct arguments
    if (hasQueryOptions) {
      await waitFor(() => {
        expect(mockSelectLicenseRequest).toHaveBeenCalledWith({
          original: [mockLicenseRequest],
          transformed: expectedRequests.subscriptionLicenses,
        });
        expect(mockSelectCouponCodeRequest).toHaveBeenCalledWith({
          original: [mockCouponCodeRequest],
          transformed: expectedRequests.couponCodes,
        });
        expect(mockSelectContentAssignment).toHaveBeenCalledWith({
          original: mockRedeemablePolicies,
          transformed: expectedContentAssignmentData,
        });
        expect(mockSelectEnrollment).toHaveBeenCalledTimes(2);
        expect(mockSelectEnrollment).toHaveBeenCalledWith({
          original: {
            enterpriseCourseEnrollments: expectedEnterpriseCourseEnrollmentsData.enrollments,
            allEnrollmentsByStatus: expectedEnterpriseCourseEnrollmentsData.enrollmentsByStatus,
          },
          transformed: expectedEnterpriseCourseEnrollmentsData,
        });
        expect(mockSelectEnrollment).toHaveBeenCalledWith(expect.objectContaining({
          transformed: expectedEnterpriseCourseEnrollmentsData,
        }));
      });
    }

    await waitFor(() => {
      const {
        allEnrollmentsByStatus,
        enterpriseCourseEnrollments,
      } = result.current.data;

      // Verify enrollments by status
      expect(allEnrollmentsByStatus.inProgress).toEqual(
        expectedTransformedAllEnrollmentsByStatus.inProgress,
      );
      expect(allEnrollmentsByStatus.upcoming).toEqual(
        expectedTransformedAllEnrollmentsByStatus.upcoming,
      );
      expect(allEnrollmentsByStatus.completed).toEqual(
        expectedTransformedAllEnrollmentsByStatus.completed,
      );
      expect(allEnrollmentsByStatus.savedForLater).toEqual(
        expectedTransformedAllEnrollmentsByStatus.savedForLater,
      );

      // Verify enrollments
      expect(enterpriseCourseEnrollments).toEqual(expectedEnterpriseCourseEnrollmentsData.enrollments);

      // Verify requests
      expect(result.current.data.requests.subscriptionLicenses).toEqual(expectedRequests.subscriptionLicenses);
      expect(result.current.data.requests.couponCodes).toEqual(expectedRequests.couponCodes);

      // Verify content assignments
      expect(result.current.data.contentAssignments).toEqual(expectedContentAssignmentData);
    });
  });
});
