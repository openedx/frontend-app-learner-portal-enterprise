import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { camelCaseObject } from '@edx/frontend-platform';
import { queryClient } from '../../../../utils/tests';
import { fetchPathwayProgressDetails } from '../services';
import { useLearnerPathwayProgressData } from './index';
import LearnerPathwayProgressData from '../../../pathway-progress/data/__mocks__/PathwayProgressListData.json';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchPathwayProgressDetails: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockLearnerPathwayProgressData = camelCaseObject(LearnerPathwayProgressData)[0].learnerPathwayProgress;
describe('useLearnerPathwayProgressData', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchPathwayProgressDetails.mockResolvedValue(mockLearnerPathwayProgressData);
    useParams.mockReturnValue({ pathwayUUID: 'test-pathway-uuid' });
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLearnerPathwayProgressData(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockLearnerPathwayProgressData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
