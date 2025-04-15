import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
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
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchPathwayProgressDetails.mockResolvedValue(mockLearnerPathwayProgressData);
    useParams.mockReturnValue({ pathwayUUID: 'test-pathway-uuid' });
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useLearnerPathwayProgressData(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockLearnerPathwayProgressData,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
