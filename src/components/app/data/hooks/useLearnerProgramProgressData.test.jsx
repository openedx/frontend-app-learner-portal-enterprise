import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchLearnerProgramProgressDetail } from '../services';
import useLearnerProgramProgressData from './useLearnerProgramProgressData';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchLearnerProgramProgressDetail: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockLearnerProgramProgressData = {
  certificateData: [],
  courseData: null,
  creditPathways: [],
  industryPathways: [],
  programData: null,
  urls: null,
};
describe('useLearnerProgramProgressData', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchLearnerProgramProgressDetail.mockResolvedValue(mockLearnerProgramProgressData);
    useParams.mockReturnValue({ programUUID: 'test-program-uuid' });
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLearnerProgramProgressData(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockLearnerProgramProgressData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
