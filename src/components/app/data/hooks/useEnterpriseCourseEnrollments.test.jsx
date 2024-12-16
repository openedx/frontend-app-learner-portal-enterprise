import { renderHook } from '@testing-library/react-hooks';
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
import useEnterpriseCourseEnrollments, { transformAllEnrollmentsByStatus } from './useEnterpriseCourseEnrollments';
import { COURSE_STATUSES } from '../../../../constants';
import { canUnenrollCourseEnrollment, transformCourseEnrollment } from '../utils';
import useBFF from './useBFF';

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
  displayName: 'Education',
  micromastersTitle: 'Demo in higher education',
  courseRunUrl: 'test-course-url',
  certificateDownloadUrl: 'test-certificate-download-url',
  emailsEnabled: false,
  dueDates: ['Finish your course soon'],
};
const mockBrowseAndRequestConfiguration = {
  id: 123,
};
const mockLicenseRequests = {
  courseId: 'test-course-id-1',
  courseTitle: 'Test Course Title 1',
  coursePartners: [{ name: 'edx' }],
  created: true,
};
const mockCouponCodeRequests = {
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

const expectedTransformedRequests = (request) => ({
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
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCourseEnrollments.mockResolvedValue([mockCourseEnrollment]);
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue([mockLicenseRequests]);
    fetchCouponCodeRequests.mockResolvedValue([mockCouponCodeRequests]);
    fetchRedeemablePolicies.mockResolvedValue(mockRedeemablePolicies);
    useBFF.mockReturnValue({ data: [mockCourseEnrollment].map(transformCourseEnrollment) });
  });

  it.each([
    { hasQueryOptions: false },
    { hasQueryOptions: true },
  ])('should return transformed enrollments data (%s)', async ({ hasQueryOptions }) => {
    const expectedEnterpriseCourseEnrollments = [{
      title: mockCourseEnrollment.displayName,
      microMastersTitle: mockCourseEnrollment.micromastersTitle,
      linkToCourse: mockCourseEnrollment.courseRunUrl,
      linkToCertificate: mockCourseEnrollment.certificateDownloadUrl,
      hasEmailsEnabled: mockCourseEnrollment.emailsEnabled,
      notifications: mockCourseEnrollment.dueDates,
      canUnenroll: canUnenrollCourseEnrollment(mockCourseEnrollment),
      isCourseAssigned: false,
    }];
    const expectedRequests = {
      couponCodes: [expectedTransformedRequests(mockCouponCodeRequests)],
      subscriptionLicenses: [expectedTransformedRequests(mockLicenseRequests)],
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

    const mockSelectEnrollment = jest.fn().mockReturnValue(expectedEnterpriseCourseEnrollments);
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
    const { result, waitForNextUpdate } = renderHook(
      () => {
        if (hasQueryOptions) {
          return useEnterpriseCourseEnrollments(queryOptions);
        }
        return useEnterpriseCourseEnrollments();
      },
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    // Call the mocked useBFF's input select functions
    const useBFFArgs = useBFF.mock.calls[0][0];
    const { select: selectBFFQuery } = useBFFArgs.bffQueryOptions;
    const { select: selectFallbackBFFQuery } = useBFFArgs.fallbackQueryConfig;
    selectBFFQuery({ enterpriseCourseEnrollments: [mockCourseEnrollment] });
    selectFallbackBFFQuery([mockCourseEnrollment]);

    // Assert that passed select fn query options were called with the correct arguments
    if (hasQueryOptions) {
      expect(mockSelectLicenseRequest).toHaveBeenCalledWith({
        original: [mockLicenseRequests],
        transformed: expectedRequests.subscriptionLicenses,
      });
      expect(mockSelectCouponCodeRequest).toHaveBeenCalledWith({
        original: [mockCouponCodeRequests],
        transformed: expectedRequests.couponCodes,
      });
      expect(mockSelectContentAssignment).toHaveBeenCalledWith({
        original: mockRedeemablePolicies,
        transformed: expectedContentAssignmentData,
      });
      expect(mockSelectEnrollment).toHaveBeenCalledWith({
        original: [mockCourseEnrollment],
        transformed: expectedEnterpriseCourseEnrollments,
      });
    }

    const expectedTransformedAllEnrollmentsByStatus = transformAllEnrollmentsByStatus({
      enterpriseCourseEnrollments: expectedEnterpriseCourseEnrollments,
      requests: expectedRequests,
      contentAssignments: expectedContentAssignmentData,
    });

    expect(result.current.data.allEnrollmentsByStatus).toEqual(expectedTransformedAllEnrollmentsByStatus);
    expect(result.current.data.enterpriseCourseEnrollments).toEqual(expectedEnterpriseCourseEnrollments);
    expect(result.current.data.contentAssignments).toEqual(expectedContentAssignmentData);
    expect(result.current.data.requests).toEqual(expectedRequests);
  });
});
