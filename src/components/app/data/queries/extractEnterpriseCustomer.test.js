import { resetAllWhenMocks, when } from 'jest-when';
import {
  authenticatedUserFactory,
  enterpriseCustomerFactory,
  enterpriseCustomerUserFactory,
} from '../services/data/__factories__';
import extractEnterpriseCustomer from './extractEnterpriseCustomer';
import { queryEnterpriseLearner, queryEnterpriseLearnerDashboardBFF } from './queries';

const mockEnsureQueryData = jest.fn();

const mockQueryClient = {
  ensureQueryData: mockEnsureQueryData,
};
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerUser = enterpriseCustomerUserFactory({
  enterprise_customer: {
    ...mockEnterpriseCustomer,
    slug: mockEnterpriseCustomer.slug,
  },
});
const mockBFFRequestUrl = new URL(`/${mockEnterpriseCustomer.slug}`, 'https://example.com');
const mockNonBFFRequestUrl = new URL(`/${mockEnterpriseCustomer.slug}/search`, 'https://example.com');
const getQueryEnterpriseLearner = ({ hasEnterpriseSlug = true } = {}) => queryEnterpriseLearner(
  mockAuthenticatedUser.username,
  hasEnterpriseSlug ? mockEnterpriseCustomer.slug : undefined,
);

describe('extractEnterpriseCustomer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllWhenMocks();
  });

  it.each([
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: undefined,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: true,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: undefined,
      isBFFRoute: true,
    },
    // iaBFFRoute false
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: undefined,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
      isBFFRoute: false,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: undefined,
      isBFFRoute: false,
    },
  ])('should return or throw error as expected (%s)', async ({
    routeEnterpriseSlug,
    enterpriseCustomerUser,
    staffEnterpriseCustomer,
    expectedEnterpriseCustomer,
    isBFFRoute,
  }) => {
    const args = {
      requestUrl: isBFFRoute ? mockBFFRequestUrl : mockNonBFFRequestUrl,
      queryClient: mockQueryClient,
      authenticatedUser: mockAuthenticatedUser,
      enterpriseSlug: routeEnterpriseSlug,
    };
    const queryEnterpriseLearnerResult = {
      enterpriseCustomer: expectedEnterpriseCustomer,
      activeEnterpriseCustomer: enterpriseCustomerUser?.enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: enterpriseCustomerUser ? [enterpriseCustomerUser] : [],
      staffEnterpriseCustomer,
      enterpriseFeatures: { something: true },
      shouldUpdateActiveEnterpriseCustomerUser: false,
    };
    when(mockEnsureQueryData)
      .calledWith(
        expect.objectContaining({
          queryKey: isBFFRoute
            ? queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: routeEnterpriseSlug }).queryKey
            : getQueryEnterpriseLearner({ hasEnterpriseSlug: !!routeEnterpriseSlug }).queryKey,
        }),
      )
      .mockResolvedValue(queryEnterpriseLearnerResult);
    try {
      const enterpriseCustomer = await extractEnterpriseCustomer(args);
      expect(enterpriseCustomer).toEqual(expectedEnterpriseCustomer);
    } catch (error) {
      expect(error.message).toBe(`Could not find enterprise customer for slug ${routeEnterpriseSlug}`);
    }
  });
});
