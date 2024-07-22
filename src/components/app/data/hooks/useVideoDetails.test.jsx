import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { queryVideoDetail } from '../queries';
import useVideoDetails from './useVideoDetails';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  queryVideoDetail: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('./useEnterpriseCustomer');

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const mockVideoDetailsData = {
  uuid: 'video-uuid',
  title: 'My Awesome Video',
  description: 'This is a great video.',
  duration: 120,
  thumbnail: 'example.com/videos/images/awesome-video.png',
};

describe('useVideoDetails', () => {
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
    useParams.mockReturnValue({ videoUUID: 'video-uuid' });
    queryVideoDetail.mockImplementation((videoUUID, enterpriseUUID) => ({
      queryKey: ['videoDetail', videoUUID, enterpriseUUID, mockVideoDetailsData],
      queryFn: () => Promise.resolve(mockVideoDetailsData),
    }));
  });

  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useVideoDetails(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockVideoDetailsData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });

  it('should handle loading state correctly', () => {
    queryVideoDetail.mockImplementation(() => ({
      queryKey: ['videoDetail'],
      queryFn: () => new Promise(() => {}), // Simulate loading
    }));

    const { result } = renderHook(() => useVideoDetails(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
  });

  it('should handle error state correctly', async () => {
    const mockError = new Error('Failed to fetch video details');
    queryVideoDetail.mockImplementation(() => ({
      queryKey: ['videoDetail', mockError],
      queryFn: () => Promise.reject(mockError),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useVideoDetails(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });
});
