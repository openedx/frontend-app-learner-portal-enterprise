import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchCourseMetadata } from '../services';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useCourseMetadata from './useCourseMetadata';
import useRedeemablePolicies from './useRedeemablePolicies';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useLateEnrollmentBufferDays');
jest.mock('./useRedeemablePolicies');

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
  courseRuns: [{
    isMarketable: true,
    availability: 'Current',
    enrollmentStart: dayjs().add(10, 'day').toISOString(),
    enrollmentEnd: dayjs().add(15, 'day').toISOString(),
    key: 'course-v1:edX+DemoX+2T2020',
    isEnrollable: true,
  }],
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
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCourseMetadata.mockResolvedValue(mockCourseMetadata);
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useLateEnrollmentBufferDays.mockReturnValue(undefined);
    useSearchParams.mockReturnValue([new URLSearchParams({ course_run_key: 'course-v1:edX+DemoX+2T2024' })]);
    useRedeemablePolicies.mockReturnValue({ data: mockBaseRedeemablePolicies });
  });
  it('should handle resolved value correctly with no select function passed', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: {
          ...mockCourseMetadata,
          availableCourseRuns: [mockCourseMetadata.courseRuns[0]],
        },
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle resolved value correctly when no data is returned from course metadata', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result, waitForNextUpdate } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: null,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle resolved value correctly when data is returned with a select function passed', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseMetadata(
      { select: (data) => data },
    ), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: {
          original: mockCourseMetadata,
          transformed: {
            ...mockCourseMetadata,
            availableCourseRuns: [mockCourseMetadata.courseRuns[0]],
          },
        },
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle resolved value correctly when no data is returned with a select function passed', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result, waitForNextUpdate } = renderHook(() => useCourseMetadata(
      { select: (data) => data },
    ), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: null,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  // TODO: verify test works bc it passes no matter what value I put for the course run key.
  it('should return available course run corresponding to allocated course run', async () => {
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
    useLateEnrollmentBufferDays.mockReturnValue(undefined);
    useSearchParams.mockReturnValue([new URLSearchParams({})]);

    const mockCourseRuns = [
      ...mockCourseMetadata.courseRuns,
      {
        ...mockCourseMetadata.courseRuns[0],
        key: 'course-v1:edX+DemoX+2018',
      },
    ];

    const mockAllocatedAssignments = [{
      parentContentKey: 'edX+DemoX',
      contentKey: 'course-v1:edX+DemoX+2T2020',
      isAssignedCourseRun: true,
    },
    {
      parentContentKey: 'edX+DemoX',
      contentKey: 'course-v1:edX+DemoX+2018',
      isAssignedCourseRun: true,
    }, {
      parentContentKey: null,
      contentKey: 'edX+DemoX',
      isAssignedCourseRun: false,
    }];
    const mockLearnerContentAssignments = {
      allocatedAssignments: mockAllocatedAssignments,
      hasAllocatedAssignments: mockAllocatedAssignments.length > 0,
    };

    fetchCourseMetadata.mockResolvedValue({ ...mockCourseMetadata, courseRuns: mockCourseRuns });
    useRedeemablePolicies.mockReturnValue({
      data: {
        ...mockBaseRedeemablePolicies,
        learnerContentAssignments: {
          ...mockBaseRedeemablePolicies.learnerContentAssignments, ...mockLearnerContentAssignments,
        },
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useCourseMetadata(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: {
          ...mockCourseMetadata,
          courseRuns: mockCourseRuns,
          availableCourseRuns: mockCourseRuns,
        },
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
