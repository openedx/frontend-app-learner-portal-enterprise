import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import { fetchUserEntitlements } from '../services';
import useUserEntitlements from './useUserEntitlements';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchUserEntitlements: jest.fn().mockResolvedValue(null),
}));
const mockUserEntitlements = [
  'test-entitlement',
];
describe('useUserEntitlements', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchUserEntitlements.mockResolvedValue(mockUserEntitlements);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useUserEntitlements(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockUserEntitlements,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});
