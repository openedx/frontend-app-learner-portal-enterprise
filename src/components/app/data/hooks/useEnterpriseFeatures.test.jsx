import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { render, screen, waitFor } from '@testing-library/react';
import { authenticatedUserFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerData } from '../services';
import { useEnterpriseFeatures, useEnterpriseLearner } from './index';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
}));
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
  enterpriseFeatures: {
    featurePrequerySearchSuggestions: true,
  },
  staffEnterpriseCustomer: null,
};

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
  it('should return nested hook value correctly', async () => {
    const {
      result,
      waitForNextUpdate,
    } = renderHook(() => useEnterpriseLearner(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockEnterpriseLearnerData,
      }),
    );
  });
  it('should handle parent hook return value correctly with select', async () => {
    const EnterpriseFeatures = ({ queryOptions }) => {
      const { data: enterpriseFeatures } = useEnterpriseFeatures(queryOptions);
      return (
        <div>{JSON.stringify(enterpriseFeatures)}</div>
      );
    };

    render(
      <Wrapper>
        <EnterpriseFeatures queryOptions={{ select: (data) => data }} />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByText(JSON.stringify(mockEnterpriseLearnerData.enterpriseFeatures))).toBeTruthy();
    });
  });
});
