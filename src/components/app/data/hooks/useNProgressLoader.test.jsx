import { renderHook, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import nprogress from 'accessible-nprogress';
import { useFetchers, useNavigation } from 'react-router-dom';
import { useIsFetching } from '@tanstack/react-query';

import useNProgressLoader from './useNProgressLoader';
import { authenticatedUserFactory } from '../services/data/__factories__';

jest.mock('accessible-nprogress', () => ({
  start: jest.fn(),
  done: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigation: jest.fn(),
  useFetchers: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useIsFetching: jest.fn(),
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
    useNavigation.mockReturnValue({ state: 'idle' });
    useFetchers.mockReturnValue([]);
    useIsFetching.mockReturnValue(0);
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

  it('should start nprogress, but not call done with pending queries', async () => {
    useIsFetching.mockReturnValue(1);
    const Wrapper = ({ children }) => (
      <AppContext.Provider value={appContextValueWithHydratedUser}>
        {children}
      </AppContext.Provider>
    );
    const { result } = renderHook(() => useNProgressLoader({ handleQueryFetching: true }), { wrapper: Wrapper });

    await waitFor(() => {
      expect(nprogress.start).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(nprogress.done).not.toHaveBeenCalled();
    });

    expect(result.current).toBe(true);
  });

  it('should call nprogress done with hydrated user', async () => {
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
