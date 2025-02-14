import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import { fetchLearnerSkillLevels } from '../services';
import useLearnerSkillLevels from './useLearnerSkillLevels';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchLearnerSkillLevels: jest.fn().mockResolvedValue(null),
}));
const mockLearnerSkillLevels = [
  'introductory',
];
describe('useLearnerSkillLevels', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchLearnerSkillLevels.mockResolvedValue(mockLearnerSkillLevels);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useLearnerSkillLevels(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockLearnerSkillLevels,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
