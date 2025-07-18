import { screen } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../utils/tests';
import makeCourseLoader from '../courseLoader';
import {
  extractEnterpriseCustomer,
  queryBrowseAndRequestConfiguration,
  queryCanRedeem,
  queryCanRequest,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryCourseMetadata,
  queryCourseRecommendations,
  queryCourseReviews,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseCustomerContainsContent,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  queryUserEntitlements,
} from '../../../app/data';
import { ensureAuthenticatedUser } from '../../../app/routes/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';

jest.mock('../../../app/routes/data', () => ({
  ...jest.requireActual('../../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));

const mockCourseKey = 'edX+DemoX';
const mockCourseRunKey = 'course-v1:edX+DemoX+Demo_Course';
const mockSubscriptionCatalog = 'test-subscription-catalog-uuid';
const mockEnterpriseCustomer = enterpriseCustomerFactory();
extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);

const mockAuthenticatedUser = authenticatedUserFactory();

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
  getQueryData: jest.fn(),
};

describe('courseLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <div>hello world</div>,
      loader: makeCourseLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseKey}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it.each([
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: false,
      assignments: {
        allocatedAssignments: [],
      },
      hasAssignmentForCourse: false,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: false,
      assignments: {
        hasAllocatedAssignments: true,
        allocatedAssignments: [{
          contentKey: mockCourseKey,
          parentContentKey: null,
          isAssignedCourseRun: false,
        }],
      },
      hasAssignmentForCourse: true,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: false,
      assignments: {
        hasAllocatedAssignments: true,
        allocatedAssignments: [{
          contentKey: mockCourseRunKey,
          parentContentKey: mockCourseKey,
          isAssignedCourseRun: true,
        }],
      },
      hasAssignmentForCourse: true,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: true,
      assignments: {
        allocatedAssignments: [{ contentKey: mockCourseKey }],
      },
      hasAssignmentForCourse: true,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: true,
      assignments: {
        hasAllocatedAssignments: true,
        allocatedAssignments: [{
          contentKey: mockCourseRunKey,
          parentContentKey: mockCourseKey,
          isAssignedCourseRun: true,
        }],
      },
      hasAssignmentForCourse: true,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: true,
      assignments: {
        allocatedAssignments: [{ contentKey: 'edX+DemoY' }],
      },
      hasAssignmentForCourse: false,
    },
    {
      hasCourseMetadata: true,
      isAssignmentOnlyLearner: true,
      assignments: {
        hasAllocatedAssignments: true,
        allocatedAssignments: [{
          contentKey: 'course-v1:edX+DemoY+Demo_Course',
          parentContentKey: 'edX+DemoY',
          isAssignedCourseRun: true,
        }],
      },
      hasAssignmentForCourse: false,
    },
    {
      hasCourseMetadata: false,
      isAssignmentOnlyLearner: false,
      assignments: {
        allocatedAssignments: [],
      },
      hasAssignmentForCourse: false,
    },
  ])('ensures the requisite course-related metadata data is resolved (%s)', async ({
    hasCourseMetadata,
    isAssignmentOnlyLearner,
    assignments,
    hasAssignmentForCourse,
  }) => {
    const mockCourseMetadata = {
      key: mockCourseKey,
      courseRuns: [{
        key: mockCourseRunKey,
        isMarketable: true,
        isEnrollable: true,
        availability: 'Current',
      }],
    };

    const mockAllocatedAssignments = assignments?.allocatedAssignments || [];

    // When `ensureQueryData` is called with the course metadata
    // query, ensure its mock return value is the course metadata
    // for the dependent course redemption eligibility query.
    const courseMetadataQuery = queryCourseMetadata(mockCourseKey);

    // When `ensureQueryData`/`getQueryData` is called with the course metadata query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: courseMetadataQuery.queryKey,
      }),
    ).mockResolvedValue(hasCourseMetadata ? mockCourseMetadata : null);
    when(mockQueryClient.getQueryData).calledWith(
      expect.objectContaining({
        queryKey: courseMetadataQuery.queryKey,
      }),
    ).mockReturnValue(hasCourseMetadata ? mockCourseMetadata : null);

    // When `ensureQueryData` is called with the redeemable policies query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryRedeemablePolicies({
          enterpriseUuid: mockEnterpriseCustomer.uuid,
          lmsUserId: mockAuthenticatedUser.userId,
        }).queryKey,
      }),
    ).mockResolvedValue({
      redeemablePolicies: [],
      learnerContentAssignments: {
        allocatedAssignments: mockAllocatedAssignments,
        hasAllocatedAssignments: mockAllocatedAssignments.length > 0,
      },
    });

    // When `ensureQueryData` is called with the subscriptions query,
    // ensure its mock return value is valid.
    const mockSubscriptionPlan = {
      uuid: 'test-subscription-plan-uuid',
      enterpriseCatalogUuid: mockSubscriptionCatalog,
      isCurrent: true,
    };
    const mockSubscriptionsData = isAssignmentOnlyLearner
      ? null
      : {
        subscriptionLicense: {
          status: LICENSE_STATUS.ACTIVATED,
          subscriptionPlan: mockSubscriptionPlan,
        },
        subscriptionPlan: mockSubscriptionPlan,
        customerAgreement: {
          uuid: 'test-customer-agreement-uuid',
        },
      };
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: querySubscriptions(mockEnterpriseCustomer.uuid).queryKey,
      }),
    ).mockResolvedValue({
      customerAgreement: mockSubscriptionsData?.customerAgreement,
      subscriptionLicense: mockSubscriptionsData?.subscriptionLicense,
      subscriptionPlan: mockSubscriptionsData?.subscriptionPlan,
    });

    // When `ensureQueryData` is called with the enterprise learner offers query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseLearnerOffers(mockEnterpriseCustomer.uuid).queryKey,
      }),
    ).mockResolvedValue({
      hasCurrentEnterpriseOffers: false,
      currentEnterpriseOffers: [],
    });

    // When `ensureQueryData` is called with the coupon codes query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCouponCodes(mockEnterpriseCustomer.uuid).queryKey,
      }),
    ).mockResolvedValue({
      couponCodeAssignments: [],
    });

    // When `ensureQueryData` is called with the license requests query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryLicenseRequests(mockEnterpriseCustomer.uuid, mockAuthenticatedUser.email).queryKey,
      }),
    ).mockResolvedValue([]);

    // When `ensureQueryData` is called with the coupon codes requests query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCouponCodeRequests(mockEnterpriseCustomer.uuid, mockAuthenticatedUser.email).queryKey,
      }),
    ).mockResolvedValue([]);

    // When `ensureQueryData` is called with the browse and request configuration query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryBrowseAndRequestConfiguration(mockEnterpriseCustomer.uuid).queryKey,
      }),
    ).mockResolvedValue({
      subsidyRequestsEnabled: false,
      subsidyType: null,
    });

    // When `ensureQueryData` is called with the course reviews query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCourseReviews(mockCourseKey).queryKey,
      }),
    ).mockResolvedValue(null);

    // When `ensureQueryData` is called with the contains content query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseCustomerContainsContent(mockEnterpriseCustomer.uuid, [mockCourseKey]).queryKey,
      }),
    ).mockResolvedValue({
      catalogList: ['test-catalog-uuid'],
    });

    // When `ensureQueryData` is called with the course recommendations query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCourseRecommendations(mockEnterpriseCustomer.uuid, mockCourseKey, []).queryKey,
      }),
    ).mockResolvedValue({
      allRecommendations: [],
      samePartnerRecommendations: [],
    });

    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCanRequest(mockEnterpriseCustomer.uuid, mockCourseKey).queryKey,
      }),
    ).mockResolvedValue({
      canRequest: false,
      requestableSubsidyAccessPolicy: null,
      reason: null,
    });

    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <div>hello world</div>,
      loader: makeCourseLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/course/${mockCourseKey}`],
      routes: [
        {
          path: '/:enterpriseSlug',
          element: <div data-testid="dashboard" />,
        },
      ],
    });
    if (isAssignmentOnlyLearner && !hasAssignmentForCourse) {
      expect(await screen.findByTestId('dashboard')).toBeInTheDocument();
    } else {
      expect(await screen.findByText('hello world')).toBeInTheDocument();
    }

    // Assert that the expected number of queries were made.
    let expectedQueryCount;
    if (hasCourseMetadata) {
      if (isAssignmentOnlyLearner && !hasAssignmentForCourse) {
        expectedQueryCount = 14;
      } else {
        expectedQueryCount = 15;
      }
    } else {
      expectedQueryCount = 14;
    }
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(expectedQueryCount);

    // Redeemable policies query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryRedeemablePolicies({
          enterpriseUuid: mockEnterpriseCustomer.uuid,
          lmsUserId: mockAuthenticatedUser.userId,
        }).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Subscriptions query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: querySubscriptions(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Enterprise learner offers query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseLearnerOffers(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Coupon codes query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCouponCodes(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // License requests query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryLicenseRequests(mockEnterpriseCustomer.uuid, mockAuthenticatedUser.email).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Coupon code requests query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCouponCodeRequests(mockEnterpriseCustomer.uuid, mockAuthenticatedUser.email).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Browse and request configuration query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryBrowseAndRequestConfiguration(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course metadata query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: courseMetadataQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course redemption eligibility query
    const canRedeemQuery = queryCanRedeem(
      mockEnterpriseCustomer.uuid,
      mockCourseMetadata.key,
      [mockCourseRunKey],
    );
    if (hasCourseMetadata) {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: canRedeemQuery.queryKey,
          queryFn: expect.any(Function),
        }),
      );
    } else {
      expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: canRedeemQuery.queryKey,
          queryFn: expect.any(Function),
        }),
      );
    }

    // Course can request query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCanRequest(mockEnterpriseCustomer.uuid, mockCourseKey).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course enrollments query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseCourseEnrollments(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Contains content query
    const containsContentQuery = queryEnterpriseCustomerContainsContent(
      mockEnterpriseCustomer.uuid,
      [mockCourseMetadata.key],
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: containsContentQuery.queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // User entitlements query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryUserEntitlements().queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course reviews query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCourseReviews(mockCourseMetadata.key).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course recommendations query
    const courseRecommendationsQuery = queryCourseRecommendations(
      mockEnterpriseCustomer.uuid,
      mockCourseMetadata.key,
      isAssignmentOnlyLearner ? [] : [mockSubscriptionCatalog],
    );
    if (isAssignmentOnlyLearner && !hasAssignmentForCourse) {
      expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: courseRecommendationsQuery.queryKey,
          queryFn: expect.any(Function),
        }),
      );
    } else {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: courseRecommendationsQuery.queryKey,
          queryFn: expect.any(Function),
        }),
      );
    }
  });
});
