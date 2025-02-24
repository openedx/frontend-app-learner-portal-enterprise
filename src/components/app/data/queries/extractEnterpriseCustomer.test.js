import { resetAllWhenMocks, when } from 'jest-when';
import {
  authenticatedUserFactory,
  enterpriseCustomerFactory,
  enterpriseCustomerUserFactory,
} from '../services/data/__factories__';
import extractEnterpriseCustomer from './extractEnterpriseCustomer';
import { queryEnterpriseLearner } from './queries';

const mockEnsureQueryData = jest.fn();

const mockQueryClient = {
  ensureQueryData: mockEnsureQueryData,
};
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerUser = enterpriseCustomerUserFactory({
  enterprise_customer: mockEnterpriseCustomer,
});
const mockRequestUrl = {
  pathname: mockEnterpriseCustomer.slug,
};
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
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: undefined,
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseCustomerUser: mockEnterpriseCustomerUser,
      staffEnterpriseCustomer: mockEnterpriseCustomer,
      expectedEnterpriseCustomer: mockEnterpriseCustomer,
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseCustomerUser: undefined,
      staffEnterpriseCustomer: undefined,
      expectedEnterpriseCustomer: undefined,
    },
  ])('should return or throw error as expected (%s)', async ({
    routeEnterpriseSlug,
    enterpriseCustomerUser,
    staffEnterpriseCustomer,
    expectedEnterpriseCustomer,
  }) => {
    const args = {
      requestUrl: mockRequestUrl,
      queryClient: mockQueryClient,
      authenticatedUser: mockAuthenticatedUser,
      enterpriseSlug: routeEnterpriseSlug,
    };
    const queryEnterpriseLearnerResult = {
      activeEnterpriseCustomer: enterpriseCustomerUser?.enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: enterpriseCustomerUser ? [enterpriseCustomerUser] : [],
      staffEnterpriseCustomer,
    };
    const queryEnterpriseLearnerQueryKey = getQueryEnterpriseLearner({
      hasEnterpriseSlug: !!routeEnterpriseSlug,
    }).queryKey;
    when(mockEnsureQueryData)
      .calledWith(
        expect.objectContaining({
          queryKey: queryEnterpriseLearnerQueryKey,
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
