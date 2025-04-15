import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { queryClient } from '../../../../utils/tests';
import { fetchCourseMetadata } from '../services';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useVideoCourseMetadata from './useVideoCourseMetadata';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useLateEnrollmentBufferDays');

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseMetadata: jest.fn().mockResolvedValue(null),
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
const courseKey = 'edX+DemoX';

describe('useVideoCourseMetadata', () => {
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
    useLateEnrollmentBufferDays.mockReturnValue(undefined);
  });

  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useVideoCourseMetadata(courseKey), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: {
            ...mockCourseMetadata,
            availableCourseRuns: [mockCourseMetadata.courseRuns[0]],
          },
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });

  it('should handle resolved value correctly when no data is returned from video course metadata', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result } = renderHook(() => useVideoCourseMetadata(courseKey), { wrapper: Wrapper });
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

  it('should handle resolved value correctly when no data is returned with a select function passed', async () => {
    fetchCourseMetadata.mockResolvedValue(null);
    const { result } = renderHook(() => useVideoCourseMetadata(
      courseKey,
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
});
