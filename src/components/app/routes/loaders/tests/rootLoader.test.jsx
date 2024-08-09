import { useEffect } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { Outlet, useLocation } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeRootLoader from '../rootLoader';
import { ensureAuthenticatedUser } from '../../data';
import {
  extractEnterpriseCustomer,
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

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseCustomer: jest.fn(),
  updateUserActiveEnterprise: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  configure: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  configure: jest.fn(),
  getLoggingService: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerTwo = enterpriseCustomerFactory();

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
};

let locationPathname;
const ComponentWithLocation = ({ children }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    locationPathname = pathname;
  }, [pathname]);
  return children || null;
};

describe('rootLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
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
    // {
    //   enterpriseSlug: mockEnterpriseCustomerTwo.slug,
    //   enterpriseCustomer: mockEnterpriseCustomerTwo,
    //   activeEnterpriseCustomer: mockEnterpriseCustomer,
    //   allLinkedEnterpriseCustomerUsers: [
    //     { enterpriseCustomer: mockEnterpriseCustomer },
    //     { enterpriseCustomer: mockEnterpriseCustomerTwo },
    //   ],
    //   isStaffUser: false,
    //   shouldRedirectToSearch: false,
    // },
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldRedirectToSearch: true,
    },
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomer,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: false,
      shouldRedirectToSearch: false,
    },
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomer,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: false,
      shouldRedirectToSearch: true,
    },
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: true,
      shouldRedirectToSearch: false,
    },
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
      ],
      isStaffUser: true,
      shouldRedirectToSearch: true,
    },
  ])('ensures all requisite root loader queries are resolved with an active enterprise customer user (%s)', async ({
    isStaffUser,
    enterpriseSlug,
    enterpriseCustomer,
    activeEnterpriseCustomer,
    allLinkedEnterpriseCustomerUsers,
    shouldRedirectToSearch,
  }) => {
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
        hasAssignmentsForDisplay: !shouldRedirectToSearch,
      },
    };
    const redeemablePoliciesQuery = queryRedeemablePolicies({
      enterpriseUuid: enterpriseCustomer.uuid,
      lmsUserId: 3,
    });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
      }),
    ).mockResolvedValue(mockRedeemablePolicies);

    // Mock subscriptions query
    const mockSubscriptionsData = {
      customerAgreement: null,
      licensesByStatus: {},
    };
    const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: subscriptionsQuery.queryKey,
      }),
    ).mockResolvedValue(mockSubscriptionsData);

    renderWithRouterProvider({
      path: '/:enterpriseSlug/*',
      element: <ComponentWithLocation><Outlet /></ComponentWithLocation>,
      loader: makeRootLoader(mockQueryClient),
      children: [
        {
          path: 'search',
          element: <ComponentWithLocation />,
        },
      ],
    }, {
      initialEntries: [`/${enterpriseSlug}`],
    });

    const isLinked = allLinkedEnterpriseCustomerUsers.some((ecu) => ecu.enterpriseCustomer.slug === enterpriseSlug);

    await waitFor(() => {
      // Assert that the expected number of queries were made.
      if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
        if (isLinked || isStaffUser) {
          expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(9);
        } else {
          expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(2);
        }
      } else if (shouldRedirectToSearch) {
        // queries are executed again when redirecting to search
        expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(18);
      } else {
        expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(9);
      }
    });

    function getExpectedSlugPath() {
      if (enterpriseSlug === activeEnterpriseCustomer?.slug) {
        return enterpriseSlug;
      }
      if (isLinked || isStaffUser) {
        return enterpriseCustomer.slug;
      }
      return activeEnterpriseCustomer.slug;
    }
    const expectedCustomerPath = getExpectedSlugPath();
    // Assert that the expected number of queries were made.
    if (shouldRedirectToSearch) {
      expect(locationPathname).toEqual(`/${expectedCustomerPath}/search`);
    } else {
      expect(locationPathname).toEqual(`/${expectedCustomerPath}`);
    }

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

    // Subscriptions query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: subscriptionsQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

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
  });
});
