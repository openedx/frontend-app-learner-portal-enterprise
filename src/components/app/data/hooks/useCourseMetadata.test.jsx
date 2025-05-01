import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router-dom';

import { queryClient } from '../../../../utils/tests';
import { fetchCourseMetadata } from '../services';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useCourseMetadata from './useCourseMetadata';
import useRedeemablePolicies from './useRedeemablePolicies';
import useEnterpriseCustomerContainsContent from './useEnterpriseCustomerContainsContent';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../../../constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useLateEnrollmentBufferDays');
jest.mock('./useRedeemablePolicies');
jest.mock('./useEnterpriseCustomerContainsContent');

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseMetadata: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockCourseMetadata = {
  key: 'edX+DemoX',
  courseRuns: [
    // Happy case, should appear in the output.
    {
      isMarketable: true,
      availability: 'Current',
      enrollmentStart: dayjs().add(-10, 'day').toISOString(),
      enrollmentEnd: dayjs().add(15, 'day').toISOString(),
      key: 'course-v1:edX+DemoX+2T2020',
      isEnrollable: true,
      restrictionType: null,
    },
    // Throw in a non-marketable run.
    {
      isMarketable: false,
      availability: 'Current',
      enrollmentStart: dayjs().add(-10, 'day').toISOString(),
      enrollmentEnd: dayjs().add(15, 'day').toISOString(),
      key: 'course-v1:edX+DemoX+2T2020unmarketable',
      isEnrollable: true,
      restrictionType: null,
    },
    // Throw in a couple restricted runs.
    {
      isMarketable: true,
      availability: 'Current',
      enrollmentStart: dayjs().add(-10, 'day').toISOString(),
      enrollmentEnd: dayjs().add(15, 'day').toISOString(),
      key: 'course-v1:edX+DemoX+2T2020restricted.a',
      isEnrollable: true,
      restrictionType: ENTERPRISE_RESTRICTION_TYPE,
    },
    {
      isMarketable: true,
      availability: 'Current',
      enrollmentStart: dayjs().add(-10, 'day').toISOString(),
      enrollmentEnd: dayjs().add(15, 'day').toISOString(),
      key: 'course-v1:edX+DemoX+2T2020restricted.b',
      isEnrollable: true,
      restrictionType: ENTERPRISE_RESTRICTION_TYPE,
    },
  ],
};

const mockBaseRedeemablePolicies = {
  redeemablePolicies: [],
  expiredPolicies: [],
  unexpiredPolicies: [],
  learnerContentAssignments: {
    assignments: [],
    hasAssignments: false,
    allocatedAssignments: [],
    hasAllocatedAssignments: false,
    acceptedAssignments: [],
    hasAcceptedAssignments: false,
    canceledAssignments: [],
    hasCanceledAssignments: false,
    expiredAssignments: [],
    hasExpiredAssignments: false,
    erroredAssignments: [],
    hasErroredAssignments: false,
    assignmentsForDisplay: [],
    hasAssignmentsForDisplay: false,
  },
};

describe('useCourseMetadata', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    fetchCourseMetadata.mockResolvedValue(mockCourseMetadata);
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useLateEnrollmentBufferDays.mockReturnValue(undefined);
    useSearchParams.mockReturnValue([new URLSearchParams()]);
    useRedeemablePolicies.mockReturnValue({ data: mockBaseRedeemablePolicies });
    useEnterpriseCustomerContainsContent.mockReturnValue({ data: {} });
  });

  it('should handle resolved value correctly with no select function passed', async () => {
    const { result } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: {
            ...mockCourseMetadata,
            availableCourseRuns: [
              mockCourseMetadata.courseRuns[0],
              mockCourseMetadata.courseRuns[2],
              mockCourseMetadata.courseRuns[3],
            ],
          },
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });

  it('should handle resolved value correctly when no data is returned from course metadata', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: null,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });

  it('should handle resolved value correctly when data is returned with a select function passed', async () => {
    const { result } = renderHook(() => useCourseMetadata(
      { select: (data) => data },
    ), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: {
            original: mockCourseMetadata,
            transformed: {
              ...mockCourseMetadata,
              availableCourseRuns: [
                mockCourseMetadata.courseRuns[0],
                mockCourseMetadata.courseRuns[2],
                mockCourseMetadata.courseRuns[3],
              ],
            },
          },
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });

  it('should handle resolved value correctly when no data is returned with a select function passed', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result } = renderHook(() => useCourseMetadata(
      { select: (data) => data },
    ), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: null,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });

  it('should return available course run corresponding to course_run_key query param', async () => {
    const courseRunKeyQueryParam = 'course-v1:edX+DemoX+2018';
    useSearchParams.mockReturnValue([new URLSearchParams({ course_run_key: courseRunKeyQueryParam })]);

    const mockCourseRuns = [{
      ...mockCourseMetadata.courseRuns[0],
      key: courseRunKeyQueryParam,
    }];

    // Since there's a URL param asking for a specific run, only that run will be returned.
    fetchCourseMetadata.mockResolvedValue({
      ...mockCourseMetadata,
      courseRuns: mockCourseRuns,
    });

    const { result } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });

    await waitFor(() => {
      // The actual thing uniquely tested in this unit test is if the URL param gets passed to fetchCourseMetadata().
      expect(fetchCourseMetadata.mock.calls[0][0]).toEqual('edX+DemoX');
      expect(result.current).toEqual(
        expect.objectContaining({
          data: {
            ...mockCourseMetadata,
            // The requested run is available, so should appear in both lists below:
            courseRuns: mockCourseRuns,
            availableCourseRuns: mockCourseRuns,
          },
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
