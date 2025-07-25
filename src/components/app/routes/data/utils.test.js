import { waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import {
  ALGOLIA_QUERY_CACHE_EPSILON,
  queryEnterpriseLearnerDashboardBFF,
  queryEnterpriseLearnerSearchBFF,
  resolveBFFQuery,
  transformEnterpriseCustomer,
  updateUserActiveEnterprise,
} from '../../data';
import {
  algoliaQueryCacheValidator,
  checkValidUntil,
  ensureActiveEnterpriseCustomerUser,
  validateAlgoliaValidUntil,
} from './utils';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../data/services/data/__factories__';
import { generateTestPermutations } from '../../../../utils/tests';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  updateUserActiveEnterprise: jest.fn(),
  resolveBFFQuery: jest.fn(),
}));

describe('transformEnterpriseCustomer', () => {
  const factoryActiveIntegrations = enterpriseCustomerFactory().activeIntegrations;
  it.each([
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: false,
      activeIntegrations: [],
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: true,
      activeIntegrations: [],
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: false,
      activeIntegrations: [],
      expectedDisableSearch: true,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: true,
      activeIntegrations: factoryActiveIntegrations,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: true,
    },
  ])('returns transformed enterprise customer with enabled learner portal (%s)', ({
    identityProvider,
    enableIntegratedCustomerLearnerPortalSearch,
    activeIntegrations,
    expectedDisableSearch,
    expectedShowIntegrationWarning,
  }) => {
    const enterpriseCustomer = {
      enableLearnerPortal: true,
      enableIntegratedCustomerLearnerPortalSearch,
      identityProvider,
      activeIntegrations,
      brandingConfiguration: {
        primaryColor: '#123456',
        secondaryColor: '#789abc',
        tertiaryColor: '#def012',
      },
    };
    const result = transformEnterpriseCustomer(enterpriseCustomer);
    expect(result).toEqual({
      ...enterpriseCustomer,
      brandingConfiguration: {
        ...enterpriseCustomer.brandingConfiguration,
        primaryColor: '#123456',
        secondaryColor: '#789abc',
        tertiaryColor: '#def012',
      },
      disableSearch: expectedDisableSearch,
      showIntegrationWarning: expectedShowIntegrationWarning,
    });
  });
});

describe('ensureActiveEnterpriseCustomerUser', () => {
  // active enterprise customer
  const mockEnterpriseCustomerOne = enterpriseCustomerFactory();
  // inactive enterprise customer
  const mockEnterpriseCustomerTwo = enterpriseCustomerFactory({
    active: false,
  });

  const mockEnterpriseSlugOne = mockEnterpriseCustomerOne.slug;

  const mockActiveEnterpriseCustomer = mockEnterpriseCustomerOne;

  const mockAllLinkedEnterpriseCustomerUsers = [
    {
      id: 1,
      enterpriseCustomer: mockEnterpriseCustomerOne,
      active: true,
    },
    {
      id: 2,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      active: false,
    },
  ];
  const mockShouldUpdateActiveEnterpriseCustomerUser = false;
  const mockEnterpriseLearnerData = {
    enterpriseCustomer: mockEnterpriseCustomerOne,
    activeEnterpriseCustomer: mockActiveEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers: mockAllLinkedEnterpriseCustomerUsers,
    shouldUpdateActiveEnterpriseCustomerUser: mockShouldUpdateActiveEnterpriseCustomerUser,
  };

  const mockRequestUrl = new URL(`/${mockEnterpriseSlugOne}`, 'http://localhost');

  const mockAuthenticatedUser = authenticatedUserFactory();

  const mockQueryClient = {
    ensureQueryData: jest.fn().mockResolvedValue(),
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.each(generateTestPermutations({
    isBFFData: [true, false],
    shouldUpdateActiveEnterpriseCustomerUser: [true, false],
  }))('should update active enterprise customer if shouldUpdateActiveEnterpriseCustomerUser is (%s)', async ({
    isBFFData,
    shouldUpdateActiveEnterpriseCustomerUser,
  }) => {
    resolveBFFQuery.mockReturnValue(isBFFData ? queryEnterpriseLearnerDashboardBFF : null);
    const updatedEnterpriseCustomerMetadata = shouldUpdateActiveEnterpriseCustomerUser
      // If the customer is updated, we update expected output from ensureActiveEnterpriseCustomerUser and
      // verify the active customer is updated
      ? {
        expectedEnterpriseCustomer: mockEnterpriseCustomerTwo,
        timesUpdateActiveEnterpriseCustomerCalled: 1,
        expectedAllLinkedEnterpriseCustomers: [
          {
            id: 1,
            enterpriseCustomer: mockEnterpriseCustomerOne,
            active: false,
          },
          {
            id: 2,
            enterpriseCustomer: mockEnterpriseCustomerTwo,
            active: true,
          },
        ],
      }
      // If the customer is not updated, it should return the current enterprise customer and
      // not update the active enterprise
      : {
        expectedEnterpriseCustomer: mockEnterpriseCustomerOne,
        timesUpdateActiveEnterpriseCustomerCalled: 0,
        expectedAllLinkedEnterpriseCustomers: mockAllLinkedEnterpriseCustomerUsers,
      };

    const {
      expectedEnterpriseCustomer,
      timesUpdateActiveEnterpriseCustomerCalled,
      expectedAllLinkedEnterpriseCustomers,
    } = updatedEnterpriseCustomerMetadata;

    // If we need to update the active enterprise customer, set the inactive customer to the current enterprise customer
    const updatedMockEnterpriseLearnerData = {
      ...mockEnterpriseLearnerData,
      enterpriseCustomer: expectedEnterpriseCustomer,
      shouldUpdateActiveEnterpriseCustomerUser,
    };

    const {
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
    } = await ensureActiveEnterpriseCustomerUser({
      enterpriseLearnerData: updatedMockEnterpriseLearnerData,
      enterpriseSlug: mockEnterpriseSlugOne,
      isBFFData,
      requestUrl: mockRequestUrl,
      authenticatedUser: mockAuthenticatedUser,
      queryClient: mockQueryClient,
    });

    await waitFor(
      // We should expect the active enterprise customer to be updated if
      // the shouldUpdateActiveEnterpriseCustomerUser is true
      () => {
        expect(updateUserActiveEnterprise).toHaveBeenCalledTimes(
          timesUpdateActiveEnterpriseCustomerCalled,
        );
        // We can assume a truthy shouldUpdateActiveEnterpriseCustomerUser resulted in a successful BFF call,
        // therefore, we can validate that the query cache has been optimistically updated.

        if (shouldUpdateActiveEnterpriseCustomerUser) {
          expect(updateUserActiveEnterprise).toHaveBeenCalledWith({
            enterpriseCustomer: expectedEnterpriseCustomer,
          });
          if (isBFFData) {
            expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(timesUpdateActiveEnterpriseCustomerCalled);
            const expectedQuery = queryEnterpriseLearnerDashboardBFF({
              enterpriseSlug: expectedEnterpriseCustomer.slug,
            });
            expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(expectedQuery.queryKey, expect.any(Function));
            // Get the function that was passed to setQueryData
            const updateFunction = mockQueryClient.setQueryData.mock.calls[0][1];
            const result = updateFunction(mockEnterpriseLearnerData);
            expect(result).toEqual({
              enterpriseCustomer: expectedEnterpriseCustomer,
              activeEnterpriseCustomer: expectedEnterpriseCustomer,
              allLinkedEnterpriseCustomerUsers: expectedAllLinkedEnterpriseCustomers,
              shouldUpdateActiveEnterpriseCustomerUser: false,
            });
          }
        }
      },
    );
    expect(enterpriseCustomer).toEqual(updatedEnterpriseCustomerMetadata.expectedEnterpriseCustomer);
    expect(allLinkedEnterpriseCustomerUsers).toEqual(
      updatedEnterpriseCustomerMetadata.expectedAllLinkedEnterpriseCustomers,
    );
  });
});

describe('checkValidUntil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('returns false if no validUntil is provided', () => {
    expect(
      checkValidUntil(null, ALGOLIA_QUERY_CACHE_EPSILON),
    ).toEqual(false);
  });
  it.each([
    {
      validUntilOffset: 25,
      expectedValue: true,
    },
    {
      validUntilOffset: 75,
      expectedValue: false,
    },
    {
      validUntilOffset: -30,
      expectedValue: true,
    },
  ])('returns expectedValue if validUntil is greater or less then the epsilon threshold (%s)', ({
    validUntilOffset,
    expectedValue,
  }) => {
    const validUntil = dayjs().add(validUntilOffset, 'second');
    expect(
      checkValidUntil(validUntil, ALGOLIA_QUERY_CACHE_EPSILON),
    ).toEqual(expectedValue);
  });
});

describe('algoliaQueryCacheValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('does not call with null validUntil', () => {
    const mockInvalidateQueries = jest.fn();
    algoliaQueryCacheValidator(
      null,
      ALGOLIA_QUERY_CACHE_EPSILON,
      mockInvalidateQueries,
    );
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(0);
  });
  it.each([
    {
      validUntilOffset: 25,
      timesCalled: 1,
    },
    {
      validUntilOffset: 75,
      timesCalled: 0,
    },
    {
      validUntilOffset: -30,
      timesCalled: 1,
    },
  ])('calls expected function when checkValidUntil resolves (%s)', ({
    validUntilOffset,
    timesCalled,
  }) => {
    const mockInvalidateQueries = jest.fn();
    const validUntil = dayjs().add(validUntilOffset, 'second');
    algoliaQueryCacheValidator(
      validUntil,
      ALGOLIA_QUERY_CACHE_EPSILON,
      mockInvalidateQueries,
    );
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(timesCalled);
  });
});

describe('validateAlgoliaValidUntil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveBFFQuery.mockReturnValue(queryEnterpriseLearnerSearchBFF);
  });
  it.each(generateTestPermutations(
    {
      isBFFData: [true, false],
      validUntil: [
        dayjs().add(1, 'hour').toISOString(),
        null,
        dayjs().subtract(1, 'hour').toISOString(),
      ],
    },
  ))('validate invalidation behavior (%s)', async ({
    isBFFData,
    validUntil,
  }) => {
    const mockQueryClient = {
      ensureQueryData: jest.fn().mockResolvedValue(),
      getQueryData: jest.fn().mockResolvedValue({
        algolia: {
          validUntil,
        },
      }),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    };
    await validateAlgoliaValidUntil({
      queryClient: mockQueryClient,
      requestUrl: {
        pathname: '/testSlug/search',
      },
      isBFFData,
      enterpriseSlug: 'testSlug',
    });
    if (!isBFFData) {
      expect(mockQueryClient.getQueryData).not.toHaveBeenCalled();
    } else if (validUntil) {
      expect(mockQueryClient.getQueryData).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        if (checkValidUntil(validUntil, ALGOLIA_QUERY_CACHE_EPSILON)) {
          expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(1);
        } else {
          expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
        }
      });
    } else {
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    }
  });
});
