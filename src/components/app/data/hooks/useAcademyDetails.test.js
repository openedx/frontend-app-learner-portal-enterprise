import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchAcademiesDetail } from '../services';
import useAcademyDetails from './useAcademyDetails';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchAcademiesDetail: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockAcademyDetailsData = {
  uuid: 'academy-uuid',
  title: 'My Awesome Academy',
  shortDescription: 'I am a short academy description.',
  longDescription: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      description: 'description 222',
    },
  ],
};

describe('useAcademiesDetails', () => {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ academyUUID: 'academy-uuid' });
  });
  it('should handle resolved value correctly', async () => {
    fetchAcademiesDetail.mockResolvedValue(mockAcademyDetailsData);
    const { result, waitForNextUpdate } = renderHook(() => useAcademyDetails(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockAcademyDetailsData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle rejected value correctly', async () => {
    const errorMessage = new Error('Test Error');
    fetchAcademiesDetail.mockRejectedValue(errorMessage);
    const { result, waitForNextUpdate } = renderHook(() => useAcademyDetails(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        failureReason: errorMessage,
        isError: true,
      }),
    );
  });
});
