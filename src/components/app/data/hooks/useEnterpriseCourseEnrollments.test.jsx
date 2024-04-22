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
import useEnterpriseCourseEnrollments from './useEnterpriseCourseEnrollments';
import { COURSE_STATUSES } from '../../../../constants';

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
const mockCourseEnrollments = [{ key: 'edX+DemoX' }];
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
    fetchEnterpriseCourseEnrollments.mockResolvedValue(mockCourseEnrollments);
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue([mockLicenseRequests]);
    fetchCouponCodeRequests.mockResolvedValue([mockCouponCodeRequests]);
    fetchRedeemablePolicies.mockResolvedValue(mockRedeemablePolicies);
  });
  it('should return transformed requests', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCourseEnrollments(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current.data.requests).toEqual({
      couponCodes: [{
        courseRunId: mockCouponCodeRequests.courseId,
        title: mockCouponCodeRequests.courseTitle,
        orgName: mockCouponCodeRequests.coursePartners?.map(partner => partner.name).join(', '),
        courseRunStatus: COURSE_STATUSES.requested,
        linkToCourse: `${mockEnterpriseCustomer.slug}/course/${mockCouponCodeRequests.courseId}`,
        created: mockCouponCodeRequests.created,
        notifications: [],
      }],
      subscriptionLicenses: [{
        courseRunId: mockLicenseRequests.courseId,
        title: mockLicenseRequests.courseTitle,
        orgName: mockLicenseRequests.coursePartners?.map(partner => partner.name).join(', '),
        courseRunStatus: COURSE_STATUSES.requested,
        linkToCourse: `${mockEnterpriseCustomer.slug}/course/${mockLicenseRequests.courseId}`,
        created: mockLicenseRequests.created,
        notifications: [],
      }],
    });
  });
});
