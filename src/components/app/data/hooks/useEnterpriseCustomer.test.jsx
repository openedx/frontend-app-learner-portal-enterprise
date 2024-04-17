import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { authenticatedUserFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerData } from '../services';
import { useEnterpriseLearner } from './index';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
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
    useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise-slug' });
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
  it('should handle parent hook return value correctly', async () => {
    const EnterpriseCustomer = () => {
      const { data: enterpriseCustomer } = useEnterpriseCustomer();
      return (
        <>
          <div>{enterpriseCustomer?.uuid}</div>
          <div>{enterpriseCustomer?.slug}</div>
        </>
      );
    };

    render(
      <Wrapper>
        <EnterpriseCustomer />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByText(mockEnterpriseLearnerData.enterpriseCustomer.uuid)).toBeTruthy();
      expect(screen.getByText(mockEnterpriseLearnerData.enterpriseCustomer.slug)).toBeTruthy();
    });
  });
  it('should handle parent hook return value correctly with select', async () => {
    const EnterpriseCustomer = ({ queryOptions }) => {
      const { data: enterpriseCustomer } = useEnterpriseCustomer(queryOptions);
      return (
        <>
          <div>{JSON.stringify(enterpriseCustomer?.original)}</div>
          <div>{JSON.stringify(enterpriseCustomer?.transformed)}</div>
        </>
      );
    };

    render(
      <Wrapper>
        <EnterpriseCustomer queryOptions={{ select: (data) => data }} />
      </Wrapper>,
    );
    await waitFor(() => {
      expect(screen.getByText(JSON.stringify(mockEnterpriseLearnerData))).toBeTruthy();
      expect(screen.getByText(JSON.stringify(mockEnterpriseLearnerData.enterpriseCustomer))).toBeTruthy();
    });
  });
});
