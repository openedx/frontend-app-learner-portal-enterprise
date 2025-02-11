import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard, fetchEnterpriseLearnerData } from '../services';
import { useEnterpriseFeatures } from './index';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseLearnerData: jest.fn().mockResolvedValue(null),
  fetchEnterpriseLearnerDashboard: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseLearnerData = {
  transformed: {
    enterpriseCustomer: mockEnterpriseCustomer,
    enterpriseCustomerUserRoleAssignments: [],
    activeEnterpriseCustomer: null,
    activeEnterpriseCustomerUserRoleAssignments: [],
    allLinkedEnterpriseCustomerUsers: [],
    staffEnterpriseCustomer: null,
    enterpriseFeatures: {
      isBFFEnabled: false,
    },
  },
};

const mockBFFDashboardData = {
  enterpriseCustomer: mockEnterpriseCustomer,
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {
    isBFFEnabled: true,
  },
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

const mockExpectedEnterpriseFeatures = (isMatchedRoute) => (isMatchedRoute
  ? mockBFFDashboardData.enterpriseFeatures
  : mockEnterpriseLearnerData.transformed.enterpriseFeatures);
describe('useEnterpriseFeatures', () => {
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
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
    fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
    useParams.mockReturnValue({ enterpriseSlug: 'test-slug' });
  });

  it.each([
    { isMatchedRoute: false },
    { isMatchedRoute: true },
  ])('should return enterprise features correctly (%s)', async ({ isMatchedRoute }) => {
    const mockSelect = jest.fn(data => data.transformed);
    const { result, waitForNextUpdate } = renderHook(
      () => {
        if (isMatchedRoute) {
          return useEnterpriseFeatures({ select: mockSelect });
        }
        return useEnterpriseFeatures();
      },
      {
        wrapper: ({ children }) => Wrapper({
          routes: isMatchedRoute ? '/test-enterprise' : 'test-enterprise/search',
          children,
        }),
      },
    );
    await waitForNextUpdate();
    if (isMatchedRoute) {
      expect(mockSelect).toHaveBeenCalledTimes(2);
    } else {
      expect(mockSelect).toHaveBeenCalledTimes(0);
    }

    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseFeatures(isMatchedRoute));
  });
});
