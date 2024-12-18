import { when, resetAllWhenMocks } from 'jest-when';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import extractEnterpriseFeatures from './extractEnterpriseFeatures';
import { queryEnterpriseLearner } from './queries';

const mockEnsureQueryData = jest.fn();
const mockQueryClient = {
  ensureQueryData: mockEnsureQueryData,
};
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const getQueryEnterpriseLearner = ({ hasEnterpriseSlug = true } = {}) => queryEnterpriseLearner(
  mockAuthenticatedUser.username,
  hasEnterpriseSlug ? mockEnterpriseCustomer.slug : undefined,
);

describe('extractEnterpriseFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAllWhenMocks();
  });

  it.each([
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseFeatures: { featureA: true, featureB: false },
    },
    {
      routeEnterpriseSlug: undefined,
      enterpriseFeatures: { featureA: true, featureB: false },
    },
    {
      routeEnterpriseSlug: mockEnterpriseCustomer.slug,
      enterpriseFeatures: { featureA: true, featureB: false },
    },
  ])('should return the correct enterprise features (%s)', async ({
    routeEnterpriseSlug,
    enterpriseFeatures,
  }) => {
    const args = {
      queryClient: mockQueryClient,
      authenticatedUser: mockAuthenticatedUser,
      enterpriseSlug: routeEnterpriseSlug,
    };

    const queryEnterpriseLearnerResult = {
      enterpriseFeatures,
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

    const features = await extractEnterpriseFeatures(args);
    expect(features).toEqual(enterpriseFeatures);
  });

  it('should throw an error if enterprise features cannot be found', async () => {
    const routeEnterpriseSlug = mockEnterpriseCustomer.slug;
    const args = {
      queryClient: mockQueryClient,
      authenticatedUser: mockAuthenticatedUser,
      enterpriseSlug: routeEnterpriseSlug,
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
      .mockRejectedValue(new Error('Could not retrieve enterprise features'));

    await expect(extractEnterpriseFeatures(args)).rejects.toThrow(
      'Could not retrieve enterprise features',
    );
  });
});
