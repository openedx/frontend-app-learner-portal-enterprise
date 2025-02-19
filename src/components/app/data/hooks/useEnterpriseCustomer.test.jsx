import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard, fetchEnterpriseLearnerData } from '../services';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
  fetchEnterpriseLearnerDashboard: jest.fn().mockResolvedValue(null),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseLearnerData = {
  enterpriseCustomer: mockEnterpriseCustomer,
  enterpriseCustomerUserRoleAssignments: [],
  activeEnterpriseCustomer: null,
  activeEnterpriseCustomerUserRoleAssignments: [],
  allLinkedEnterpriseCustomerUsers: [],
  staffEnterpriseCustomer: null,
  enterpriseFeatures: {
    isBFFEnabled: false,
  },
  shouldUpdateActiveEnterpriseCustomerUser: false,
};
const mockBFFDashboardData = {
  enterpriseCustomer: {
    ...mockEnterpriseCustomer,
    isBFFEnabled: true,
  },
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {
    isBFFEnabled: true,
  },
  shouldUpdateActiveEnterpriseCustomerUser: false,
  enterpriseCustomerUserSubsidies: {
    subscriptions: {
      customerAgreement: {},
      subscriptionLicenses: [],
      subscriptionLicensesByStatus: {
        activated: [],
        assigned: [],
        expired: [],
        revoked: [],
      },
    },
  },
  enterpriseCourseEnrollments: [],
  errors: [],
  warnings: [],
};

const mockExpectedEnterpriseCustomers = (isMatchedRoute) => (isMatchedRoute
  ? mockBFFDashboardData.enterpriseCustomer
  : mockEnterpriseLearnerData.enterpriseCustomer);

describe('useEnterpriseCustomer', () => {
  const Wrapper = ({ initialEntries = [], children }) => (
    <QueryClientProvider client={queryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <Routes>
            <Route path=":enterpriseSlug" element={children} />
            <Route path=":enterpriseSlug/search" element={children} />
          </Routes>
          {children}
        </AppContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
  });
  it.each([
    { isMatchedRoute: false },
    { isMatchedRoute: true },
  ])('should return enterprise customers correctly (%s)', async ({ isMatchedRoute }) => {
    const mockSelect = jest.fn(data => data.transformed);
    const initialEntries = isMatchedRoute ? ['/test-enterprise'] : ['/test-enterprise/search'];
    const { result, waitForNextUpdate } = renderHook(
      () => {
        if (isMatchedRoute) {
          return useEnterpriseCustomer({ select: mockSelect });
        }
        return useEnterpriseCustomer();
      },
      {
        wrapper: ({ children }) => (
          <Wrapper initialEntries={initialEntries}>
            {children}
          </Wrapper>
        ),
      },
    );
    await waitForNextUpdate();
    if (isMatchedRoute) {
      expect(mockSelect).toHaveBeenCalledTimes(4);
    } else {
      expect(mockSelect).toHaveBeenCalledTimes(0);
    }

    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseCustomers(isMatchedRoute));
  });
});
