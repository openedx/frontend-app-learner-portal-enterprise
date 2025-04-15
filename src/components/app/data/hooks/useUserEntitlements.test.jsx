import { Suspense } from 'react';
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
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
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
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
