import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import useIsBFFEnabled from './useIsBFFEnabled';
import { queryEnterpriseLearnerDashboardBFF, resolveBFFQuery } from '../queries';
import { queryClient } from '../../../../utils/tests';
import { authenticatedUserFactory } from '../services/data/__factories__';

jest.mock('../queries', () => ({
  ...jest.requireActual('../queries'),
  resolveBFFQuery: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();

describe('useIsBFFEnabled', () => {
  const Wrapper = ({ routes = null, children }) => (
    <QueryClientProvider client={queryClient()}>
      <MemoryRouter initialEntries={[routes]}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          {children}
        </AppContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    { hasBFFEnabled: false },
    { hasBFFEnabled: true },
  ])('should return expected value based on whether BFF is enabled (%s)', ({ hasBFFEnabled }) => {
    const route = hasBFFEnabled ? '/test-enterprise' : 'test-enterprise/search';

    resolveBFFQuery.mockReturnValue(hasBFFEnabled ? queryEnterpriseLearnerDashboardBFF : null);

    const { result } = renderHook(() => useIsBFFEnabled(), {
      wrapper: ({ children }) => Wrapper({
        routes: route,
        children,
      }),
    });

    expect(result.current).toBe(hasBFFEnabled);
  });
});
