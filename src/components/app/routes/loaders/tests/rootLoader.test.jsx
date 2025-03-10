import { getConfig } from '@edx/frontend-platform/config';
import { when } from 'jest-when';
import { screen, waitFor } from '@testing-library/react';
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
  queryEnterpriseLearnerDashboardBFF,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryNotices,
  queryRedeemablePolicies,
  querySubscriptions,
  updateUserActiveEnterprise,
} from '../../../data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../data/services/data/__factories__';
import { LICENSE_STATUS } from '../../../../enterprise-user-subsidy/data/constants';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(),
}));
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

const mockLocationAssign = jest.fn();

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerTwo = enterpriseCustomerFactory();

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
};

describe('rootLoader', () => {
  // Preserves original window location, and swaps it back after test is completed
  const currentLocation = global.location;

  beforeAll(() => {
    delete global.location;
    global.location = { ...currentLocation, assign: mockLocationAssign };
  });
  afterAll(() => {
    global.location = currentLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({
      ENABLE_NOTICES: null,
    });
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

  it('redirects to notice if the user has unacknowledged notices', async () => {
    getConfig.mockReturnValue({
      ENABLE_NOTICES: true,
    });
    const mockNoticeRedirectUrl = 'http://notices.example.com';
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryNotices().queryKey,
      }),
    ).mockResolvedValue(mockNoticeRedirectUrl);
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}`],
    });
    await waitFor(() => {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
      expect(mockLocationAssign).toHaveBeenCalledTimes(1);
      expect(mockLocationAssign).toHaveBeenCalledWith(mockNoticeRedirectUrl);
    });
  });

  it.each([
    { isMatchedBFFRoute: false },
    { isMatchedBFFRoute: true },
  ])('ensures only the enterprise-learner query is called if there is no active enterprise customer user, (%s)', async ({ isMatchedBFFRoute }) => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockAuthenticatedUser.username, mockEnterpriseCustomer.slug);
    const enterpriseBFFQuery = queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockEnterpriseCustomer.slug });

    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer: undefined,
      activeEnterpriseCustomer: undefined,
    });

    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseBFFQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer: undefined,
      activeEnterpriseCustomer: undefined,
      allLinkedEnterpriseCustomerUsers: [],
      shouldUpdateActiveEnterpriseCustomerUser: false,
    });

    const routeMetadata = isMatchedBFFRoute
      ? { path: '/:enterpriseSlug', initialEntries: [`/${mockEnterpriseCustomer.slug}`] }
      : { path: '/:enterpriseSlug/search', initialEntries: [`/${mockEnterpriseCustomer.slug}/search`] };
    renderWithRouterProvider({
      path: routeMetadata.path,
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: routeMetadata.initialEntries,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: false,
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
      isMatchedBFFRoute: true,
    },
  ])('ensures all requisite root loader queries are resolved with an active enterprise customer user (%s)', async ({
    isStaffUser,
    enterpriseSlug,
    enterpriseCustomer,
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
    shouldActivateSubscriptionLicense,
    isMatchedBFFRoute,
  }) => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockAuthenticatedUser.username, enterpriseSlug);
    const enterpriseLearnerQueryTwo = queryEnterpriseLearner(mockAuthenticatedUser.username, enterpriseCustomer.slug);
    const enterpriseBFFQuery = queryEnterpriseLearnerDashboardBFF({ enterpriseSlug });
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

    // Mock the BFF query to return the enterprise customer user metadata
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseBFFQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      staffEnterpriseCustomer: isStaffUser ? enterpriseCustomer : undefined,
      shouldUpdateActiveEnterpriseCustomerUser: false,
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

    const routeMetadata = isMatchedBFFRoute
      ? { path: '/:enterpriseSlug', initialEntries: [`/${enterpriseSlug}`] }
      : { path: '/:enterpriseSlug/search', initialEntries: [`/${enterpriseSlug}/search`] };

    renderWithRouterProvider({
      path: routeMetadata.path,
      element: <div data-testid="dashboard" />,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: routeMetadata.initialEntries,
    });

    const isLinked = allLinkedEnterpriseCustomerUsers.some((ecu) => ecu.enterpriseCustomer.slug === enterpriseSlug);

    await waitFor(() => {
      // Assert that the expected number of queries were made.
      let expectedQueryCount = 10;
      if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
        if (!(isLinked || isStaffUser)) {
          expectedQueryCount = 2;
        }
      } else if (isMatchedBFFRoute) {
        expectedQueryCount = 9;
      }
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(expectedQueryCount);
    });

    // Enterprise learner query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: isMatchedBFFRoute ? enterpriseBFFQuery.queryKey : enterpriseLearnerQuery.queryKey,
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
    if (!isMatchedBFFRoute) {
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
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(subscriptionsQuery.queryKey, expect.any(Function));
        // Get the function that was passed to setQueryData
        const updateFunction = mockQueryClient.setQueryData.mock.calls[0][1];
        // Call the function with a mock oldData value if needed to simulate the cache update
        const result = updateFunction({
          subscriptionLicenses: [mockSubscriptionsData.subscriptionLicense],
          subscriptionLicensesByStatus: {
            [LICENSE_STATUS.PENDING]: [mockSubscriptionsData.subscriptionLicense],
          },
          subscriptionLicense: mockSubscriptionsData.subscriptionLicense,
          subscriptionPlan: mockSubscriptionsData.subscriptionPlan,
        });
        expect(result).toEqual({
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
