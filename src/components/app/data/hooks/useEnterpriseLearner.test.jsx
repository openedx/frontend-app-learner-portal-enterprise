import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerData } from '../services';
import useEnterpriseLearner from './useEnterpriseLearner';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseLearnerData = {
  enterpriseCustomer: {
    uuid: 'test-enterprise-customer',
    slug: 'test-enterprise-slug',
  },
  enterpriseCustomerUserRoleAssignments: [],
  activeEnterpriseCustomer: null,
  activeEnterpriseCustomerUserRoleAssignments: [],
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  staffEnterpriseCustomer: null,
};

describe('useEnterpriseLearner', () => {
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
    fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseLearner(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockEnterpriseLearnerData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
