import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import {
  MemoryRouter, Route, Routes, useParams,
} from 'react-router-dom';
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
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  staffEnterpriseCustomer: null,
  shouldUpdateActiveEnterpriseCustomerUser: false,
};

const mockBFFDashboardData = {
  enterpriseCustomer: mockEnterpriseCustomer,
  activeEnterpriseCustomer: null,
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  shouldUpdateActiveEnterpriseCustomerUser: false,
  staffEnterpriseCustomer: null,
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
  const Wrapper = ({ initialEntries = [], children }) => (
    <QueryClientProvider client={queryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <Routes>
            <Route path=":enterpriseSlug/unsupported-bff-route?" element={children} />
          </Routes>
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
    if (isMatchedBFFRoute) {
      fetchEnterpriseLearnerDashboard.mockResolvedValue(mockBFFDashboardData);
    } else {
      fetchEnterpriseLearnerData.mockResolvedValue(mockEnterpriseLearnerData);
    }
    const mockSelect = jest.fn(data => data.transformed);
    const initialEntries = isMatchedBFFRoute ? ['/test-enterprise'] : ['/test-enterprise/unsupported-bff-route'];
    const enterpriseLearnerHookArgs = hasCustomSelect ? { select: mockSelect } : {};
    const { result, waitForNextUpdate } = renderHook(
      () => (useEnterpriseLearner(enterpriseLearnerHookArgs)),
      {
        wrapper: ({ children }) => (
          <Wrapper initialEntries={initialEntries}>
            {children}
          </Wrapper>
        ),
      },
    );

    await waitForNextUpdate();

    if (hasCustomSelect) {
      expect(mockSelect).toHaveBeenCalledTimes(2);
      expect(mockSelect).toHaveBeenCalledWith({
        original: isMatchedBFFRoute ? mockBFFDashboardData : mockEnterpriseLearnerData,
        transformed: mockExpectedEnterpriseLearner(isMatchedBFFRoute),
      });
    } else {
      expect(mockSelect).toHaveBeenCalledTimes(0);
    }

    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseLearner(isMatchedBFFRoute));
  });
});
