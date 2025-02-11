import { screen } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import makeDashboardLoader from './dashboardLoader';
import {
  extractEnterpriseCustomer,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseLearnerDashboardBFF,
  queryEnterprisePathwaysList,
  queryEnterpriseProgramsList,
  queryRedeemablePolicies,
  resolveBFFQuery,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
  resolveBFFQuery: jest.fn(),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
const mockEnterpriseSlug = 'test-enterprise-slug';

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('dashboardLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
    extractEnterpriseCustomer.mockResolvedValue({ uuid: mockEnterpriseId, slug: mockEnterpriseSlug });
    resolveBFFQuery.mockReturnValue(null);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div data-testid="dashboard" />,
      loader: makeDashboardLoader(mockQueryClient),
    }, [
      {
        initialEntries: [`/${mockEnterpriseSlug}`],
      },
    ]);

    expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it.each([
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: true,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: true,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}/search`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: true,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: true,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: true,
      hasEnterpriseCourseEnrollments: true,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: false,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: true,
      shouldUseBFFQuery: true,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: true,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: true,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}/search`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: true,
    },
    {
      hasAssignmentsForDisplay: true,
      hasEnterpriseCourseEnrollments: false,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: true,
    },
    {
      hasAssignmentsForDisplay: false,
      hasEnterpriseCourseEnrollments: true,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: true,
    },
    {
      hasAssignmentsForDisplay: true,
      hasEnterpriseCourseEnrollments: true,
      currentPageRoute: `/${mockEnterpriseSlug}`,
      hasVisitedDashboardBefore: false,
      shouldRedirectToSearch: false,
      shouldUseBFFQuery: true,
    },
  ])('ensures the requisite dashboard data is resolved (%s)', async ({
    hasAssignmentsForDisplay,
    hasEnterpriseCourseEnrollments,
    currentPageRoute,
    hasVisitedDashboardBefore,
    shouldRedirectToSearch,
    shouldUseBFFQuery,
  }) => {
    if (shouldUseBFFQuery) {
      resolveBFFQuery.mockReturnValue(queryEnterpriseLearnerDashboardBFF);
    } else {
      resolveBFFQuery.mockReturnValue(null);
    }
    // Mock global.location.pathname
    const mockLocation = {
      pathname: currentPageRoute,
    };
    jest.spyOn(global, 'location', 'get').mockReturnValue(mockLocation);

    // Mock localStorage, if necessary
    if (hasVisitedDashboardBefore) {
      localStorage.setItem('has-user-visited-learner-dashboard', true);
    }

    // Mock redeemable policies query
    const mockRedeemablePolicies = {
      learnerContentAssignments: {
        hasAssignmentsForDisplay,
      },
    };
    const redeemablePoliciesQuery = queryRedeemablePolicies({ enterpriseUuid: mockEnterpriseId, lmsUserId: 3 });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: redeemablePoliciesQuery.queryKey,
      }),
    ).mockResolvedValue(mockRedeemablePolicies);

    // Mock enterprise course enrollments query
    const mockEnterpriseCourseEnrollments = [];
    if (hasEnterpriseCourseEnrollments) {
      mockEnterpriseCourseEnrollments.push({ courseId: 'test-course-id' });
    }
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseCourseEnrollments(mockEnterpriseId).queryKey,
      }),
    ).mockResolvedValue(mockEnterpriseCourseEnrollments);

    // Mock bff dashboard query
    const mockBFFDashboardResponse = {
      enterpriseCustomerUserSubsidies: {
        subscriptions: {
          customerAgreement: null,
          subscriptionLicenses: [],
          subscriptionLicensesByStatus: {
            activated: [],
            assigned: [],
            expired: [],
            revoked: [],
          },
        },
      },
      enterpriseCourseEnrollments: mockEnterpriseCourseEnrollments,
      errors: [],
      warnings: [],
    };
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockEnterpriseSlug }).queryKey,
      }),
    ).mockReturnValue(mockBFFDashboardResponse);

    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug',
        element: <div data-testid="dashboard" />,
        loader: makeDashboardLoader(mockQueryClient),
      },
      {
        initialEntries: [`/${mockEnterpriseSlug}`],
        routes: [
          {
            path: '/:enterpriseSlug/search',
            element: <div data-testid="search" />,
          },
        ],
      },
    );

    if (shouldRedirectToSearch) {
      expect(await screen.findByTestId('search')).toBeInTheDocument();
    } else {
      expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    }

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(4);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: shouldUseBFFQuery
          ? queryEnterpriseLearnerDashboardBFF({ enterpriseSlug: mockEnterpriseSlug }).queryKey
          : queryEnterpriseCourseEnrollments(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseProgramsList(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryRedeemablePolicies({ enterpriseUuid: mockEnterpriseId, lmsUserId: 3 }).queryKey,
        queryFn: expect.any(Function),
      }),
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterprisePathwaysList(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
