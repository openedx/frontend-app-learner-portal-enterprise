import { renderHook } from '@testing-library/react-hooks';
import { AppContext } from '@edx/frontend-platform/react';
import nprogress from 'accessible-nprogress';
import { useFetchers, useNavigation } from 'react-router-dom';
import { waitFor } from '@testing-library/react';

import useNProgressLoader from './useNProgressLoader';
import useNotices from './useNotices';
import { authenticatedUserFactory } from '../services/data/__factories__';

jest.mock('./useNotices');

jest.mock('accessible-nprogress', () => ({
  start: jest.fn(),
  done: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigation: jest.fn(),
  useFetchers: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockHydratedAuthenticatedUser = authenticatedUserFactory({
  extended_profile: {
    extra_metadata: true,
  },
});

const defaultAppContextValue = {
  authenticatedUser: mockAuthenticatedUser,
};

const appContextValueWithHydratedUser = {
  authenticatedUser: mockHydratedAuthenticatedUser,
};

describe('useNProgressLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotices.mockReturnValue({
      data: null,
      isLoading: false,
    });
    useNavigation.mockReturnValue({ state: 'idle' });
    useFetchers.mockReturnValue([]);
  });

  it('should start nprogress, but not call done with unhydrated authenticated user', async () => {
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={defaultAppContextValue}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.start).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.done).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(false);
  });

  it('should start nprogress, but not call done with notice redirect url', async () => {
    useNotices.mockReturnValue({ data: 'http://example.com', isLoading: false });
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={defaultAppContextValue}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.start).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.done).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(false);
  });

  it('should start nprogress, but not call done with loading navigation state', async () => {
    useNavigation.mockReturnValue({ state: 'loading' });
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={appContextValueWithHydratedUser}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.start).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.done).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(true);
  });

  it('should start nprogress, but not call done with non-idle fetchers', async () => {
    useFetchers.mockReturnValue([{ state: 'loading' }]);
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={appContextValueWithHydratedUser}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.start).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.done).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(true);
  });

  it.each([
    { hasNoticesEnabled: true },
    { hasNoticesEnabled: false },
  ])('should call nprogress done with hydrated user and no notices (%s)', async ({ hasNoticesEnabled }) => {
    const noticesQueryResult = {
      data: undefined,
      isLoading: true,
    };
    if (hasNoticesEnabled) {
      noticesQueryResult.data = null;
      noticesQueryResult.isLoading = false;
    }
    useNotices.mockReturnValue(noticesQueryResult);
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={appContextValueWithHydratedUser}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.done).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.start).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(true);
  });
});
