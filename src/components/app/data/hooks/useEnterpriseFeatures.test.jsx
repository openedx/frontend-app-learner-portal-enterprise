import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import { generateTestPermutations, queryClient } from '../../../../utils/tests';
import { fetchEnterpriseLearnerDashboard, fetchEnterpriseLearnerData } from '../services';
import { useEnterpriseFeatures } from './index';

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

const mockExpectedEnterpriseFeatures = (isMatchedBFFRoute) => (isMatchedBFFRoute
  ? mockBFFDashboardData.enterpriseFeatures
  : mockEnterpriseLearnerData.enterpriseFeatures);

describe('useEnterpriseFeatures', () => {
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
    fetchEnterpriseLearnerDashboard.mockResolvedValue(undefined);
    fetchEnterpriseLearnerData.mockResolvedValue(undefined);
  });

  it.each(generateTestPermutations({
    isMatchedBFFRoute: [false, true],
    hasCustomSelect: [false, true],
  }))('should return enterprise features correctly (%s)', async ({
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
    const enterpriseFeatureHookArgs = hasCustomSelect ? { select: mockSelect } : {};
    const { result } = renderHook(
      () => (useEnterpriseFeatures(enterpriseFeatureHookArgs)),
      {
        wrapper: ({ children }) => (
          <Wrapper initialEntries={initialEntries}>
            {children}
          </Wrapper>
        ),
      },
    );
    await waitFor(() => {
      if (hasCustomSelect) {
        expect(mockSelect).toHaveBeenCalledTimes(2);
        expect(mockSelect).toHaveBeenCalledWith({
          original: isMatchedBFFRoute ? mockBFFDashboardData : mockEnterpriseLearnerData,
          transformed: mockExpectedEnterpriseFeatures(isMatchedBFFRoute),
        });
      } else {
        expect(mockSelect).toHaveBeenCalledTimes(0);
      }
    });
    const actualEnterpriseFeatures = result.current.data;
    expect(actualEnterpriseFeatures).toEqual(mockExpectedEnterpriseFeatures(isMatchedBFFRoute));
  });
});
