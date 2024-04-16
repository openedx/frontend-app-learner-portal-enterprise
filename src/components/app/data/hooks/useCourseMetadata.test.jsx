import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useParams, useSearchParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchCourseMetadata } from '../services';
import useLateRedemptionBufferDays from './useLateRedemptionBufferDays';
import useCourseMetadata from './useCourseMetadata';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useLateRedemptionBufferDays');

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
    isEnrollable: true,
  }],
};
const mockURL = new URL('https://example.com?course_run_key=edX DemoX');

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
    useLateRedemptionBufferDays.mockReturnValue(undefined);
    useSearchParams.mockReturnValue([new URLSearchParams(mockURL.search)]);
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
  it('should handle resolved value correctly when no data is returned with a select function passed', async () => {
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
});
