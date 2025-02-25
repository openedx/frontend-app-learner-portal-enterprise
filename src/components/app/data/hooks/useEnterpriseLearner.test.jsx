import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import { generateTestPermutations, queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard, fetchEnterpriseLearnerData } from '../services';
import useEnterpriseLearner from './useEnterpriseLearner';

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
  enterpriseCustomer: mockEnterpriseCustomer,
  activeEnterpriseCustomer: null,
  activeEnterpriseCustomerUserRoleAssignments: [],
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  staffEnterpriseCustomer: null,
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

const mockExpectedEnterpriseLearner = (isMatchedBFFRoute) => (isMatchedBFFRoute
  ? {
    enterpriseCustomer: mockBFFDashboardData.enterpriseCustomer,
    allLinkedEnterpriseCustomerUsers: mockBFFDashboardData.allLinkedEnterpriseCustomerUsers,
    enterpriseFeatures: mockBFFDashboardData.enterpriseFeatures,
  }
  : mockEnterpriseLearnerData);

describe('useEnterpriseLearner', () => {
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
    fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
    fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
    useParams.mockReturnValue({ enterpriseSlug: mockEnterpriseCustomer.slug });
  });

  it.each(generateTestPermutations({
    isMatchedBFFRoute: [false, true],
    hasCustomSelect: [false, true],
  }))('should return enterprise learners correctly (%s)', async ({
    isMatchedBFFRoute,
    hasCustomSelect,
  }) => {
    const mockSelect = jest.fn(data => data.transformed);
    const enterpriseLearnerHookArgs = hasCustomSelect ? { select: mockSelect } : {};
    const { result, waitForNextUpdate } = renderHook(
      () => (useEnterpriseLearner(enterpriseLearnerHookArgs)),
      {
        wrapper: ({ children }) => Wrapper({
          routes: isMatchedBFFRoute ? '/test-enterprise' : 'test-enterprise/search',
          children,
        }),
      },
    );

    await waitForNextUpdate();

    if (hasCustomSelect) {
      expect(mockSelect).toHaveBeenCalledTimes(2);
    } else {
      expect(mockSelect).toHaveBeenCalledTimes(0);
    }

    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseLearner(isMatchedBFFRoute));
  });
});
