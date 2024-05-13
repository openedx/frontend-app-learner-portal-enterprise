import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import {
  authenticatedUserFactory,
  enterpriseCustomerFactory,
  groupMembershipFactories,
} from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseGroupMemberships } from '../services';
import useEnterpriseGroupMemberships from './useEnterpriseGroupMemberships';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseGroupMemberships: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockGroupMembership = groupMembershipFactories();
const mockAuthenticatedUser = authenticatedUserFactory();
describe('useEnterpriseGroupMemberships', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseGroupMemberships.mockResolvedValue(mockGroupMembership);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseGroupMemberships(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockGroupMembership,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
