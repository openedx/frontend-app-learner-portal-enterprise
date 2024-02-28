import { screen, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeRootLoader from '../rootLoader';
import { ensureAuthenticatedUser, extractEnterpriseId } from '../../data';
import {
  makeBrowseAndRequestConfigurationQuery,
  makeContentHighlightsConfigurationQuery,
  makeCouponCodesQuery,
  makeEnterpriseLearnerOffersQuery,
  makeEnterpriseLearnerQuery,
  makeRedeemablePoliciesQuery,
} from '../../queries';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
  extractEnterpriseId: jest.fn(),
}));

const mockUsername = 'edx';
const mockUserEmail = 'edx@example.com';
const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';
ensureAuthenticatedUser.mockResolvedValue({
  userId: 3,
  email: mockUserEmail,
  username: mockUsername,
});
extractEnterpriseId.mockResolvedValue(mockEnterpriseId);

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('rootLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.clear();
  });

  it('ensures only the enterprise-learner query is called if there is no active enterprise customer user', async () => {
    const enterpriseLearnerQuery = makeEnterpriseLearnerQuery(mockUsername, mockEnterpriseSlug);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({ activeEnterpriseCustomer: null });

    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseSlug}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
  });

  it.each([
    { shouldRedirectToSearch: false },
    { shouldRedirectToSearch: true },
  ])('ensures all requisite root loader queries are resolved with an active enterprise customer user (%s)', async ({ shouldRedirectToSearch }) => {
    const enterpriseLearnerQuery = makeEnterpriseLearnerQuery(mockUsername, mockEnterpriseSlug);
    // Mock the enterprise-learner query to return an active enterprise customer user.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
      }),
    ).mockResolvedValue({
      activeEnterpriseCustomer: {
        uuid: mockEnterpriseId,
        slug: mockEnterpriseSlug,
      },
    });

    // Mock redeemable policies query
    const mockRedeemablePolicies = {
      redeemablePolicies: [],
      learnerContentAssignments: {
        hasAssignmentsForDisplay: !shouldRedirectToSearch,
      },
    };
    const redeemablePoliciesQuery = makeRedeemablePoliciesQuery({
      enterpriseUuid: mockEnterpriseId,
      lmsUserId: 3,
    });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
      }),
    ).mockResolvedValue(mockRedeemablePolicies);

    renderWithRouterProvider({
      path: '/:enterpriseSlug/*',
      element: <div>hello world</div>,
      loader: makeRootLoader(mockQueryClient),
    }, {
      routes: [
        {
          route: '/:enterpriseSlug/search',
          element: <div>search page</div>,
        },
      ],
      initialEntries: [`/${mockEnterpriseSlug}`, `/${mockEnterpriseSlug}/search`],
    });

    await waitFor(() => {
      // Assert that the expected number of queries were made.
      if (shouldRedirectToSearch) {
        // There are 7 queries, and with the redirect to the search route, each `ensureQueryData` will be called twice.
        expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(14);
      } else {
        // There are 7 queries and no redirect to search page route.
        expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(7);
      }
    });

    // Enterprise learner query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: enterpriseLearnerQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Redeemable policies query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );

    // Coupon codes query
    const couponCodesQuery = makeCouponCodesQuery(mockEnterpriseId);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: couponCodesQuery.queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );

    // Enterprise offers query
    const enterpriseOffersQuery = makeEnterpriseLearnerOffersQuery(mockEnterpriseId);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: enterpriseOffersQuery.queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );

    // Browse and Request configuration query
    const browseAndRequestConfigQuery = makeBrowseAndRequestConfigurationQuery(mockEnterpriseId, mockUserEmail);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: browseAndRequestConfigQuery.queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );

    // Content Highlights configuration query
    const contentHighlightsConfigQuery = makeContentHighlightsConfigurationQuery(mockEnterpriseId);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: contentHighlightsConfigQuery.queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );
  });
});
