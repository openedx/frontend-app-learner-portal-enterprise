import { screen } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../utils/tests';
import makeExternalCourseEnrollmentLoader from '../externalCourseEnrollmentLoader';
import {
  extractEnterpriseCustomer,
  getLateEnrollmentBufferDays,
  queryCanRedeem,
  queryCourseMetadata,
  queryRedeemablePolicies,
} from '../../../app/data';
import { ensureAuthenticatedUser } from '../../../app/routes/data/utils';
import { enterpriseCustomerFactory, authenticatedUserFactory } from '../../../app/data/services/data/__factories__';
import { isDefinedAndNotNull } from '../../../../utils/common';

jest.mock('../../../app/routes/data/utils', () => ({
  ...jest.requireActual('../../../app/routes/data/utils'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
  getLateEnrollmentBufferDays: jest.fn(),
}));
// jest.mock('@edx/frontend-platform/auth', () => ({
//   ...jest.requireActual('@edx/frontend-platform/auth'),
//   configure: jest.fn(),
// }));
// jest.mock('@edx/frontend-platform/logging', () => ({
//   ...jest.requireActual('@edx/frontend-platform/logging'),
//   configure: jest.fn(),
//   getLoggingService: jest.fn(),
// }));

const mockCourseKey = 'edX+DemoX';
const mockCourseRunKey = 'course-v1:edX+DemoX+Demo';
const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue(),
  getQueryData: jest.fn(),
};

describe('externalCourseEnrollmentLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug/:courseType?/course/:courseKey/enroll/:courseRunKey',
      element: <div>hello world</div>,
      loader: makeExternalCourseEnrollmentLoader(mockQueryClient),
    }, {
      initialEntries: [`/${mockEnterpriseCustomer.slug}/executive-education-2u/course/${mockCourseKey}/enroll/${mockCourseRunKey}`],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it.each([
    {
      hasCourseMetadata: true,
      hasSubsidyAccessPolicy: true,
      lateEnrollmentBufferDays: undefined,
      hasSuccessfulRedemption: false,
    },
    {
      hasCourseMetadata: true,
      hasSubsidyAccessPolicy: true,
      lateEnrollmentBufferDays: 30,
      hasSuccessfulRedemption: false,
    },
    {
      hasCourseMetadata: true,
      hasSubsidyAccessPolicy: true,
      lateEnrollmentBufferDays: undefined,
      hasSuccessfulRedemption: true,
    },
    {
      hasCourseMetadata: true,
      hasSubsidyAccessPolicy: true,
      lateEnrollmentBufferDays: 30,
      hasSuccessfulRedemption: true,
    },
    {
      hasCourseMetadata: false,
      hasSubsidyAccessPolicy: false,
      lateEnrollmentBufferDays: undefined,
      hasSuccessfulRedemption: false,
    },
  ])('ensures the requisite route metadata is resolved (%s)', async ({
    hasCourseMetadata,
    hasSubsidyAccessPolicy,
    lateEnrollmentBufferDays,
    hasSuccessfulRedemption,
  }) => {
    const mockCourseMetadata = {
      key: mockCourseKey,
      courseRuns: [{
        key: 'course-run-key',
        isMarketable: true,
        isEnrollable: true,
        availability: 'Current',
        seats: [{ type: 'verified', price: '100.00', sku: 'sku-1' }],
        marketingUrl: 'https://example.com',
      }],
    };
    const mockSubsidyAccessPolicy = {
      uuid: 'redeemable-policy-uuid',
      isLateRedemptionAllowed: isDefinedAndNotNull(lateEnrollmentBufferDays),
    };

    // Mock the late enrollment buffer days.
    getLateEnrollmentBufferDays.mockReturnValue(lateEnrollmentBufferDays);

    // When `ensureQueryData` is called with the course metadata
    // query, ensure its mock return value is the course metadata
    // for the dependent course redemption eligibility query.
    const courseMetadataQuery = queryCourseMetadata(mockCourseKey, mockCourseRunKey);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: courseMetadataQuery.queryKey,
      }),
    ).mockResolvedValue(hasCourseMetadata ? mockCourseMetadata : null);

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
      redeemablePolicies: hasSubsidyAccessPolicy ? [mockSubsidyAccessPolicy] : [],
      learnerContentAssignments: {
        allocatedAssignments: [],
        hasAllocatedAssignments: [],
      },
    });

    // When `ensureQueryData` is called with the canRedeem query,
    // ensure its mock return value is valid.
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: queryCanRedeem(
          mockEnterpriseCustomer.uuid,
          mockCourseMetadata,
          lateEnrollmentBufferDays,
        ).queryKey,
      }),
    ).mockResolvedValue([{
      contentKey: mockCourseRunKey,
      canRedeem: !hasSuccessfulRedemption, // If the redemption is successful, the user cannot redeem again.
      hasSuccessfulRedemption,
    }]);

    renderWithRouterProvider({
      path: '/:enterpriseSlug/:courseType?/course/:courseKey/enroll/:courseRunKey',
      element: <div>hello world</div>,
      loader: makeExternalCourseEnrollmentLoader(mockQueryClient),
    }, {
      routes: [
        {
          path: '/:enterpriseSlug/:courseType?/course/:courseKey/enroll/:courseRunKey/complete',
          element: <div>complete</div>,
        },
      ],
      initialEntries: [`/${mockEnterpriseCustomer.slug}/executive-education-2u/course/${mockCourseKey}/enroll/${mockCourseRunKey}`],
    });

    if (hasSuccessfulRedemption) {
      expect(await screen.findByText('complete')).toBeInTheDocument();
    } else {
      expect(await screen.findByText('hello world')).toBeInTheDocument();
    }

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCourseMetadata(mockCourseKey, mockCourseRunKey).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    if (hasCourseMetadata) {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryRedeemablePolicies({
            enterpriseUuid: mockEnterpriseCustomer.uuid,
            lmsUserId: mockAuthenticatedUser.userId,
          }).queryKey,
          queryFn: expect.any(Function),
        }),
      );
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryCanRedeem(mockEnterpriseCustomer.uuid, mockCourseMetadata, lateEnrollmentBufferDays).queryKey,
          queryFn: expect.any(Function),
        }),
      );
    } else {
      expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryRedeemablePolicies({
            enterpriseUuid: mockEnterpriseCustomer.uuid,
            lmsUserId: mockAuthenticatedUser.userId,
          }).queryKey,
          queryFn: expect.any(Function),
        }),
      );
      expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryCanRedeem(mockEnterpriseCustomer.uuid, mockCourseMetadata).queryKey,
          queryFn: expect.any(Function),
        }),
      );
    }
  });
});
