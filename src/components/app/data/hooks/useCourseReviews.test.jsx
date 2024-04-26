import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { queryClient } from '../../../../utils/tests';
import { fetchCourseReviews } from '../services';
import useCourseMetadata from './useCourseMetadata';
import useCourseReviews from './useCourseReviews';

jest.mock('./useCourseMetadata');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseReviews: jest.fn().mockResolvedValue(null),
}));
const mockCourseReviews = {
  course_key: 'test-course-run-key',
  reviewsCount: 345,
  avgCourseRating: 3,
  confidentLearnersPercentage: 33,
  mostCommonGoal: 'Job advancement',
  mostCommonGoalLearnersPercentage: 34,
  totalEnrollments: 4444,
};
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
describe('useCourseReviews', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    fetchCourseReviews.mockResolvedValue(mockCourseReviews);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseReviews(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockCourseReviews,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
