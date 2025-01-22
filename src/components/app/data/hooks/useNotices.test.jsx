import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import { getConfig } from '@edx/frontend-platform/config';

import { queryClient } from '../../../../utils/tests';
import useNotices from './useNotices';
import { fetchNotices } from '../services';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchNotices: jest.fn().mockResolvedValue(null),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    {children}
  </QueryClientProvider>
);

const mockLocationAssign = jest.fn();

describe('useNotices', () => {
  // Preserves original window location, and swaps it back after test is completed
  const currentLocation = window.location;
  beforeAll(() => {
    delete window.location;
    window.location = { ...currentLocation, assign: mockLocationAssign };
  });
  afterAll(() => {
    window.location = currentLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({ ENABLE_NOTICES: true });
  });

  it('should do nothing with notices disabled', () => {
    getConfig.mockReturnValue({ ENABLE_NOTICES: false });

    const { result } = renderHook(() => useNotices(), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        isLoading: true,
        isFetching: false,
      }),
    );
  });

  it('should return null and NOT redirect with no notices', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNotices(), { wrapper });

    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: null,
        isLoading: false,
        isFetching: false,
      }),
    );
  });

  it('should return redirect URL and trigger redirect with a notice', async () => {
    fetchNotices.mockResolvedValue('http://example.com');
    const { result, waitForNextUpdate } = renderHook(() => useNotices(), { wrapper });

    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: 'http://example.com',
        isLoading: false,
        isFetching: false,
      }),
    );

    expect(mockLocationAssign).toHaveBeenCalledTimes(1);
    expect(mockLocationAssign).toHaveBeenCalledWith('http://example.com');
  });
});
