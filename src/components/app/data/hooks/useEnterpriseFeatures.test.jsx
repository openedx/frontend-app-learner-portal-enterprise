import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerData } from '../services';
import { useEnterpriseFeatures } from './index';

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
  enterpriseFeatures: {
    featurePrequerySearchSuggestions: true,
  },
  staffEnterpriseCustomer: null,
};
const mockEnterpriseFeatures = mockEnterpriseLearnerData.enterpriseFeatures;

describe('useEnterpriseFeatures', () => {
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
  it('should return enterprise features correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseFeatures(), { wrapper: Wrapper });
    await waitForNextUpdate();
    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockEnterpriseFeatures);
  });
});
