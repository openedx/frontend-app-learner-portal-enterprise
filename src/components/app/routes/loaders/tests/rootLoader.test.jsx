import { useEffect } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { useLocation } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeRootLoader from '../rootLoader';
import { ensureAuthenticatedUser } from '../../data';
import {
  extractEnterpriseId,
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

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseId: jest.fn(),
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

const mockUsername = 'edx';
const mockUserEmail = 'edx@example.com';
const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseIdTwo = 'another-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
const mockEnterpriseSlugTwo = 'another-enterprise-slug';
const mockEnterpriseCustomer = {
  uuid: mockEnterpriseId,
  slug: mockEnterpriseSlug,
};
const mockEnterpriseCustomerTwo = {
  uuid: mockEnterpriseIdTwo,
  slug: mockEnterpriseSlugTwo,
};

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
  fetchQuery: jest.fn().mockResolvedValue({}),
};

let locationPathname;
const ComponentWithLocation = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    locationPathname = pathname;
  }, [pathname]);
  return null;
};

describe('rootLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    ensureAuthenticatedUser.mockResolvedValue({
      userId: 3,
      email: mockUserEmail,
      username: mockUsername,
    });
    extractEnterpriseId.mockResolvedValue(mockEnterpriseId);
  });

  it('does nothing if the user is not authenticated', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.fetchQuery).toHaveBeenCalledTimes(0);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(0);
  });

  it('ensures only the enterprise-learner query is called if there is no active enterprise customer user', async () => {
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, mockEnterpriseSlug);
    when(mockQueryClient.fetchQuery).calledWith(
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
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.fetchQuery).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(0);
  });

  it.each([
    {
      enterpriseSlug: mockEnterpriseCustomerTwo.slug,
      enterpriseCustomer: mockEnterpriseCustomerTwo,
      activeEnterpriseCustomer: mockEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers: [
        { enterpriseCustomer: mockEnterpriseCustomer },
        { enterpriseCustomer: mockEnterpriseCustomerTwo },
      ],
      isStaffUser: false,
      shouldRedirectToSearch: false,
    },
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
    const enterpriseLearnerQuery = queryEnterpriseLearner(mockUsername, enterpriseSlug);
    const enterpriseLearnerQueryTwo = queryEnterpriseLearner(mockUsername, enterpriseCustomer.slug);
    // Mock the enterprise-learner query to return an active enterprise customer user.
    when(mockQueryClient.fetchQuery).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      enterpriseCustomer,
      activeEnterpriseCustomer,
      allLinkedEnterpriseCustomerUsers,
      staffEnterpriseCustomer: isStaffUser ? enterpriseCustomer : undefined,
    });
    when(mockQueryClient.fetchQuery).calledWith(
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

    renderWithRouterProvider({
      path: '/:enterpriseSlug/*',
      element: <ComponentWithLocation />,
      loader: makeRootLoader(mockQueryClient),
    }, {
      routes: [
        {
          path: '/:enterpriseSlug/search',
          element: <ComponentWithLocation />,
        },
      ],
      initialEntries: [`/${enterpriseSlug}`],
    });

    const isLinked = allLinkedEnterpriseCustomerUsers.some((ecu) => ecu.enterpriseCustomer.slug === enterpriseSlug);

    await waitFor(() => {
      // Assert that the expected number of queries were made.
      if (enterpriseSlug !== activeEnterpriseCustomer.slug) {
        if (isLinked || isStaffUser) {
          expect(mockQueryClient.fetchQuery).toHaveBeenCalledTimes(1);
        } else {
          expect(mockQueryClient.fetchQuery).toHaveBeenCalledTimes(2);
        }
      }
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(8);
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
    expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith(
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
    const subscriptionsQuery = querySubscriptions(enterpriseCustomer.uuid);
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
    const licenseRequestsQuery = queryLicenseRequests(enterpriseCustomer.uuid, mockUserEmail);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: licenseRequestsQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Browse and Request coupon codes requests query
    const couponCodeRequestsQuery = queryCouponCodeRequests(enterpriseCustomer.uuid, mockUserEmail);
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
