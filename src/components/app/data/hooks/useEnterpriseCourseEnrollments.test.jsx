import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import {
  fetchBrowseAndRequestConfiguration, fetchCouponCodeRequests,
  fetchEnterpriseCourseEnrollments,
  fetchLicenseRequests, fetchRedeemablePolicies,
} from '../services';
import useEnterpriseCourseEnrollments, { transformAllEnrollmentsByStatus } from './useEnterpriseCourseEnrollments';
import { COURSE_STATUSES } from '../../../../constants';
import { canUnenrollCourseEnrollment } from '../utils';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseCourseEnrollments: jest.fn().mockResolvedValue(null),
  fetchBrowseAndRequestConfiguration: jest.fn().mockResolvedValue(null),
  fetchLicenseRequests: jest.fn().mockResolvedValue(null),
  fetchCouponCodeRequests: jest.fn().mockResolvedValue(null),
  fetchRedeemablePolicies: jest.fn().mockResolvedValue(null),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockCourseEnrollments = {
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
    fetchEnterpriseCourseEnrollments.mockResolvedValue([mockCourseEnrollments]);
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue([mockLicenseRequests]);
    fetchCouponCodeRequests.mockResolvedValue([mockCouponCodeRequests]);
    fetchRedeemablePolicies.mockResolvedValue(mockRedeemablePolicies);
  });
  it('should return transformed return values', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCourseEnrollments(), { wrapper: Wrapper });
    await waitForNextUpdate();
    const expectedEnterpriseCourseEnrollments = {
      title: mockCourseEnrollments.displayName,
      microMastersTitle: mockCourseEnrollments.micromastersTitle,
      linkToCourse: mockCourseEnrollments.courseRunUrl,
      linkToCertificate: mockCourseEnrollments.certificateDownloadUrl,
      hasEmailsEnabled: mockCourseEnrollments.emailsEnabled,
      notifications: mockCourseEnrollments.dueDates,
      canUnenroll: canUnenrollCourseEnrollment(mockCourseEnrollments),
      isCourseAssigned: false,
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
    const expectedContentAssignment = {
      acceptedAssignments: [],
      allocatedAssignments: [expectedTransformedLearnerContentAssignment],
      assignmentsForDisplay: [expectedTransformedLearnerContentAssignment],
      assignments: [expectedTransformedLearnerContentAssignment],
      canceledAssignments: [],
      erroredAssignments: [],
      expiredAssignments: [],
    };

    const expectedTransformedAllEnrollmentsByStatus = transformAllEnrollmentsByStatus({
      enterpriseCourseEnrollments: [expectedEnterpriseCourseEnrollments],
      requests: expectedRequests,
      contentAssignments: expectedContentAssignment,
    });

    expect(result.current.data.allEnrollmentsByStatus).toEqual(expectedTransformedAllEnrollmentsByStatus);
    expect(result.current.data.enterpriseCourseEnrollments).toEqual([expectedEnterpriseCourseEnrollments]);
    expect(result.current.data.contentAssignments).toEqual(expectedContentAssignment);
    expect(result.current.data.requests).toEqual(expectedRequests);
  });
});
