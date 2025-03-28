import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { generateTestPermutations, queryClient } from '../../../../utils/tests';
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
  activeEnterpriseCustomer: null,
  allLinkedEnterpriseCustomerUsers: [],
  staffEnterpriseCustomer: null,
  enterpriseFeatures: {},
  shouldUpdateActiveEnterpriseCustomerUser: false,
};
const mockBFFDashboardData = {
  enterpriseCustomer: mockEnterpriseCustomer,
  allLinkedEnterpriseCustomerUsers: [],
  enterpriseFeatures: {},
  staffEnterpriseCustomer: null,
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

const mockExpectedEnterpriseCustomer = (isMatchedBFFRoute) => (isMatchedBFFRoute
  ? mockBFFDashboardData.enterpriseCustomer
  : mockEnterpriseLearnerData.enterpriseCustomer);

describe('useEnterpriseCustomer', () => {
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
    fetchEnterpriseLearnerData.mockResolvedValue(undefined);
    fetchEnterpriseLearnerDashboard.mockResolvedValue(undefined);
  });
  it.each(generateTestPermutations({
    isMatchedBFFRoute: [false, true],
    hasCustomSelect: [false, true],
  }))('should return enterprise customers correctly (%s)', async ({
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
    const enterpriseCustomerHookArgs = hasCustomSelect ? { select: mockSelect } : {};
    const { result, waitForNextUpdate } = renderHook(
      () => (useEnterpriseCustomer(enterpriseCustomerHookArgs)),
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
        transformed: mockExpectedEnterpriseCustomer(isMatchedBFFRoute),
      });
    } else {
      expect(mockSelect).toHaveBeenCalledTimes(0);
    }

    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseCustomer(isMatchedBFFRoute));
  });
});
