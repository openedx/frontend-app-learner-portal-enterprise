import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import { fetchCourseRunMetadata } from '../services';
import { useCourseRunMetadata } from './index';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseRunMetadata: jest.fn().mockResolvedValue(null),
}));
const mockCourseRunMetadata = {
  seats: [{
    type: 'audit',
    price: '0.00',
    currency: 'USD',
    upgradeDeadline: null,
    upgradeDeadlineOverride: null,
    creditProvider: null,
    creditHours: null,
    sku: 'ABCDEFG',
    bulkSku: null,
  }],
  start: '2023-05-23T10:00:00Z',
  end: '2050-02-01T10:00:00Z',
  status: 'published',
  isEnrollable: true,
  isMarketable: true,
  availability: 'Current',
  key: 'course-v1:HarvardX+CS50x+2T2023',
  uuid: 'test-uuid',
  title: 'Introduction to Computer Science',
};

describe('useCourseRunMetadata', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchCourseRunMetadata.mockResolvedValue(mockCourseRunMetadata);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseRunMetadata(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockCourseRunMetadata,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
