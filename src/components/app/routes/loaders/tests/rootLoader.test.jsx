import { screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeRootLoader from '../rootLoader';
import { ensureAuthenticatedUser } from '../../data';
import {
  activateOrAutoApplySubscriptionLicense,
  extractEnterpriseCustomer,
  getBaseSubscriptionsData,
  queryAcademiesList,
  queryBrowseAndRequestConfiguration,
  queryContentHighlightsConfiguration,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryEnterpriseLearner,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  updateUserActiveEnterprise,
} from '../../../data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../data/services/data/__factories__';
import { isBFFEnabled } from '../../../data/utils';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseCustomer: jest.fn(),
  updateUserActiveEnterprise: jest.fn(),
  activateOrAutoApplySubscriptionLicense: jest.fn(),
}));
jest.mock('../../../data/utils', () => ({
  ...jest.requireActual('../../../data/utils'),
  isBFFEnabled: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerTwo = enterpriseCustomerFactory();

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
};

describe('rootLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
    extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);
  });

  it('does nothing if the user is not authenticated', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(0);
  });

  it('ensures only the enterprise-learner query is called if there is no active enterprise customer user', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockAuthenticatedUser.username, mockEnterpriseCustomer.slug);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer: undefined,
      activeEnterpriseCustomer: undefined,
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
  });

  it.each([
    // BFF disabled, non-staff user is linked to requested customer, resolves
    // requested customer, does not need to update active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomerTwo,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: false,
    },
    // BFF disabled, non-staff user is linked to requested customer, resolves
    // requested customer, does not need to update active enterprise, needs
    // to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomerTwo,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldActivateSubscriptionLicense: true,
      hasResolvedBFFQuery: false,
    },
    // BFF disabled, non-staff user is linked to requested customer, resolves
    // requested customer, needs update to active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: false,
    },
    // BFF disabled, non-staff user is not linked to requested customer, resolves
    // linked customer, does not need to update active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomer,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: false,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: false,
    },
    // BFF disabled, staff user is not linked to requested customer, resolves
    // requested customer, does not need to update active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: true,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: false,
    },
    // BFF disabled, staff user is linked to requested customer, resolves
    // requested customer, needs update to active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: true,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: false,
    },
    // BFF enabled, non-staff user is linked to requested customer, resolves
    // requested customer, needs update to active enterprise, does not
    // need to activate subscription license
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldActivateSubscriptionLicense: false,
      hasResolvedBFFQuery: true,
    },
  ])('ensures all requisite root loader queries are resolved with an active enterprise customer user (%s)', async ({
    isStaffUser,
    enterpriseSlug,
    enterpriseCustomer,
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
    shouldActivateSubscriptionLicense,
    hasResolvedBFFQuery,
  }) => {
    // Mock whether BFF enabled for enterprise customer and/or user
    isBFFEnabled.mockReturnValue(hasResolvedBFFQuery);

    const enterpriseLearnerQuery = queryEnterpriseLearner(mockAuthenticatedUser.username, enterpriseSlug);
    const enterpriseLearnerQueryTwo = queryEnterpriseLearner(mockAuthenticatedUser.username, enterpriseCustomer.slug);

    // Mock the enterprise-learner query to return an active enterprise customer user.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer,
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      staffEnterpriseCustomer: isStaffUser ? enterpriseCustomer : undefined,
    });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQueryTwo.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer,
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      staffEnterpriseCustomer: isStaffUser ? enterpriseCustomer : undefined,
    });

    // Mock redeemable policies query
    const mockRedeemablePolicies = {
      redeemablePolicies: [],
      learnerContentAssignments: {
        hasAssignmentsForDisplay: false,
      },
    };
    const redeemablePoliciesQuery = queryRedeemablePolicies({ enterpriseUuid: enterpriseCustomer.uuid, lmsUserId: 3 });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
      }),
    ).mockResolvedValue(mockRedeemablePolicies);

    // Mock subscriptions query
    const { baseSubscriptionsData, baseLicensesByStatus } = getBaseSubscriptionsData();
    const mockSubscriptionsData = { ...baseSubscriptionsData };
    if (shouldActivateSubscriptionLicense) {
      const mockAssignedLicense = {
        uuid: 'assigned-license-uuid',
        status: LICENSE_STATUS.ASSIGNED,
        activationKey: 'assigned-license-activation-key',
        subscriptionPlan: {
          uuid: 'subscription-plan-uuid',
          isCurrent: true,
        },
      };
      mockSubscriptionsData.customerAgreement = {
        uuid: 'customer-agreement-uuid',
        netDaysUntilExpiration: 30,
      };
      mockSubscriptionsData.subscriptionLicenses = [mockAssignedLicense];
      mockSubscriptionsData.subscriptionLicensesByStatus[LICENSE_STATUS.ASSIGNED] = [mockAssignedLicense];
      mockSubscriptionsData.subscriptionLicense = mockAssignedLicense;
      mockSubscriptionsData.subscriptionPlan = mockAssignedLicense.subscriptionPlan;

      // Mock the `activateOrAutoApplySubscriptionLicense` mutation
      activateOrAutoApplySubscriptionLicense.mockResolvedValue({
        ...mockAssignedLicense,
        status: LICENSE_STATUS.ACTIVATED,
      });
    }
    const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: subscriptionsQuery.queryKey,
      }),
    ).mockResolvedValue(mockSubscriptionsData);

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div data-testid="dashboard" />,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${enterpriseSlug}`],
    });

    const isLinked = allLinkedEnterpriseCustomerUsers.some((ecu) => ecu.enterpriseCustomer.slug === enterpriseSlug);

    await waitFor(() => {
      // Assert that the expected number of queries were made.
      let expectedQueryCount = 10;
      if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
        if (!(isLinked || isStaffUser)) {
          expectedQueryCount = 2;
        }
      } else if (hasResolvedBFFQuery) {
        expectedQueryCount = 9;
      }
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(expectedQueryCount);
    });

    // Enterprise learner query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );
    if (enterpriseSlug !== activeEnterpriseCustomer?.slug && isLinked) {
      expect(updateUserActiveEnterprise).toHaveBeenCalledTimes(1);
      expect(updateUserActiveEnterprise).toHaveBeenCalledWith({
        enterpriseCustomer,
      });
    } else {
      expect(updateUserActiveEnterprise).not.toHaveBeenCalled();
    }

    // Redeemable policies query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Subscriptions query (only called with BFF disabled)
    if (!hasResolvedBFFQuery) {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: subscriptionsQuery.queryKey,
          queryFn: expect.any(Function),
        }),
      );
      if (shouldActivateSubscriptionLicense) {
        expect(activateOrAutoApplySubscriptionLicense).toHaveBeenCalledTimes(1);
        expect(activateOrAutoApplySubscriptionLicense).toHaveBeenCalledWith({
          enterpriseCustomer,
          allLinkedEnterpriseCustomerUsers,
          subscriptionsData: mockSubscriptionsData,
          requestUrl: new URL(`http://localhost/${enterpriseSlug}`),
        });

        // Assert the subscriptions query cache is optimistically updated
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(subscriptionsQuery.queryKey, {
          subscriptionLicenses: [
            {
              ...mockSubscriptionsData.subscriptionLicense,
              status: LICENSE_STATUS.ACTIVATED,
            },
          ],
          subscriptionLicensesByStatus: {
            ...baseLicensesByStatus,
            [LICENSE_STATUS.ACTIVATED]: [
              {
                ...mockSubscriptionsData.subscriptionLicense,
                status: LICENSE_STATUS.ACTIVATED,
              },
            ],
          },
          subscriptionLicense: {
            ...mockSubscriptionsData.subscriptionLicense,
            status: LICENSE_STATUS.ACTIVATED,
          },
          subscriptionPlan: mockSubscriptionsData.subscriptionPlan,
        });
      }
    }

    // Coupon codes query
    const couponCodesQuery = queryCouponCodes(enterpriseCustomer.uuid);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: couponCodesQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Enterprise offers query
    const enterpriseOffersQuery = queryEnterpriseLearnerOffers(enterpriseCustomer.uuid);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: enterpriseOffersQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Browse and Request configuration query
    const browseAndRequestConfigQuery = queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: browseAndRequestConfigQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Browse and Request license requests query
    const licenseRequestsQuery = queryLicenseRequests(enterpriseCustomer.uuid, mockAuthenticatedUser.email);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: licenseRequestsQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Browse and Request coupon codes requests query
    const couponCodeRequestsQuery = queryCouponCodeRequests(enterpriseCustomer.uuid, mockAuthenticatedUser.email);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: couponCodeRequestsQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Content Highlights configuration query
    const contentHighlightsConfigQuery = queryContentHighlightsConfiguration(enterpriseCustomer.uuid);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: contentHighlightsConfigQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Academies list query
    const academiesListQuery = queryAcademiesList(enterpriseCustomer.uuid);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: academiesListQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
