import { waitFor } from '@testing-library/react';
import {
  queryEnterpriseLearnerDashboardBFF,
  resolveBFFQuery,
  transformEnterpriseCustomer,
  updateUserActiveEnterprise,
} from '../../data';
import { ensureActiveEnterpriseCustomerUser } from './utils';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../data/services/data/__factories__';
import { generateTestPermutations } from '../../../../utils/tests';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  updateUserActiveEnterprise: jest.fn(),
  resolveBFFQuery: jest.fn(),
}));

describe('transformEnterpriseCustomer', () => {
  it.each([
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: false,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: undefined,
      enableIntegratedCustomerLearnerPortalSearch: true,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: false,
      expectedDisableSearch: true,
      expectedShowIntegrationWarning: false,
    },
    {
      identityProvider: 'example-idp',
      enableIntegratedCustomerLearnerPortalSearch: true,
      expectedDisableSearch: false,
      expectedShowIntegrationWarning: true,
    },
  ])('returns transformed enterprise customer with enabled learner portal (%s)', ({
    identityProvider,
    enableIntegratedCustomerLearnerPortalSearch,
    expectedDisableSearch,
    expectedShowIntegrationWarning,
  }) => {
    const enterpriseCustomer = {
      enableLearnerPortal: true,
      enableIntegratedCustomerLearnerPortalSearch,
      identityProvider,
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
