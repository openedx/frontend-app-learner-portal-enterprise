import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerData } from '../services';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseLearnerData = {
  enterpriseCustomer: mockEnterpriseCustomer,
  enterpriseCustomerUserRoleAssignments: [],
  activeEnterpriseCustomer: null,
  activeEnterpriseCustomerUserRoleAssignments: [],
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  staffEnterpriseCustomer: null,
};

describe('useEnterpriseCustomer', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
  });
  it('should return enterprise customer metadata correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomer(), { wrapper: Wrapper });
    await waitForNextUpdate();
    const actualEnterpriseCustomer = result.current.data;
    expect(actualEnterpriseCustomer.uuid).toEqual(mockEnterpriseCustomer.uuid);
    expect(actualEnterpriseCustomer.slug).toEqual(mockEnterpriseCustomer.slug);
  });
  it('should return enterprise customer metadata correctly with select', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseCustomer({
      select: (data) => data,
    }), { wrapper: Wrapper });
    await waitForNextUpdate();
    const actualEnterpriseCustomerSelectArgs = result.current.data;
    expect(actualEnterpriseCustomerSelectArgs.original).toEqual(mockEnterpriseLearnerData);
    expect(actualEnterpriseCustomerSelectArgs.transformed).toEqual(mockEnterpriseCustomer);
  });
});
