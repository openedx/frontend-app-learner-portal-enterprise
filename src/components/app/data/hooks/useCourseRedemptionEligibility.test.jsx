import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchCanRedeem } from '../services';
import useCourseMetadata from './useCourseMetadata';
import {
  useCourseRedemptionEligibility,
  useLateEnrollmentBufferDays,
  useEnterpriseCustomerContainsContent,
} from './index';
import { transformCourseRedemptionEligibility } from './useCourseRedemptionEligibility';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../../../constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useCourseMetadata');
jest.mock('./useLateEnrollmentBufferDays');
jest.mock('./useEnterpriseCustomerContainsContent');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCanRedeem: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCourseRunKey = 'course-v1:edX+DemoX+T2024';
const mockCourseMetadata = {
  key: 'edX+DemoX',
  availableCourseRuns: [{
    key: mockCourseRunKey,
    isMarketable: true,
    availability: 'Current',
    enrollmentStart: dayjs().add(10, 'day').toISOString(),
    enrollmentEnd: dayjs().add(15, 'day').toISOString(),
    isEnrollable: true,
    restrictionType: null,
  }],
  activeCourseRun: {
    key: mockCourseRunKey,
  },
};
const mockCanRedeemData = [{
  contentKey: mockCourseRunKey,
  listPrice: {
    usd: 1,
    usdCents: 100,
  },
  redemptions: [],
  hasSuccessfulRedemption: false,
  redeemableSubsidyAccessPolicy: {
    uuid: 'test-access-policy-uuid',
    policyRedemptionUrl: 'https://enterprise-access.stage.edx.org/api/v1/policy-redemption/8c4a92c7-3578-407d-9ba1-9127c4e4cc0b/redeem/',
    isLateRedemptionAllowed: false,
    policyType: 'PerLearnerSpendCreditAccessPolicy',
    enterpriseCustomerUuid: mockEnterpriseCustomer.uuid,
    displayName: 'Learner driven plan --- Open Courses',
    description: 'Initial Policy Display Name: Learner driven plan --- Open Courses, Initial Policy Value: $10,000, Initial Subsidy Value: $260,000',
    active: true,
    retired: false,
    catalogUuid: 'test-catalog-uuid',
    subsidyUuid: 'test-subsidy-uuid',
    accessMethod: 'direct',
    spendLimit: 1000000,
    lateRedemptionAllowedUntil: null,
    perLearnerEnrollmentLimit: null,
    perLearnerSpendLimit: null,
    assignmentConfiguration: null,
  },
  canRedeem: true,
  reasons: [],
}];

const mockExpectedUseCouseRedemptionEligibilityReturn = transformCourseRedemptionEligibility({
  courseMetadata: mockCourseMetadata,
  courseRunKey: mockCourseRunKey,
  canRedeemData: mockCanRedeemData,
});

describe('useCourseRedemptionEligibility', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchCanRedeem.mockResolvedValue(mockCanRedeemData);
    useParams.mockReturnValue({ courseRunKey: mockCourseRunKey });
    useCourseMetadata.mockReturnValue({ data: mockCourseMetadata });
    useLateEnrollmentBufferDays.mockReturnValue(undefined);
    useEnterpriseCustomerContainsContent.mockReturnValue({ data: {} });
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockExpectedUseCouseRedemptionEligibilityReturn,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });

  it.each([
    {
      courseRunKey: mockCourseRunKey,
      canRedeemData: [{
        ...mockCanRedeemData[0],
        hasSuccessfulRedemption: false,
      }],
      expectedHasSuccessfulRedemption: false,
    },
    {
      courseRunKey: mockCourseRunKey,
      canRedeemData: [{
        ...mockCanRedeemData[0],
        hasSuccessfulRedemption: true,
      }],
      expectedHasSuccessfulRedemption: true,
    },
    {
      courseRunKey: null,
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          hasSuccessfulRedemption: false,
        },
        {
          ...mockCanRedeemData[0],
          hasSuccessfulRedemption: false,
        },
        {
          ...mockCanRedeemData[0],
          hasSuccessfulRedemption: true,
        },
      ],
      expectedHasSuccessfulRedemption: true,
    },
    {
      courseRunKey: null,
      canRedeemData: mockCanRedeemData,
      expectedHasSuccessfulRedemption: false,
    },
  ])('should resolve as expected for hasSuccessfulRedemption (%s)', async ({
    courseRunKey,
    canRedeemData,
    expectedHasSuccessfulRedemption,
  }) => {
    useParams.mockReturnValue({ courseRunKey });
    fetchCanRedeem.mockResolvedValue(canRedeemData);

    const { result } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.hasSuccessfulRedemption).toEqual(expectedHasSuccessfulRedemption);
    });
  });
  it.each([
    {
      courseMetadata: mockCourseMetadata,
      canRedeemData: mockCanRedeemData,
      expectedRedeemableSubsidyAccessPolicy: mockCanRedeemData[0].redeemableSubsidyAccessPolicy,
    },
    {
      courseMetadata: {
        ...mockCourseMetadata,
        activeCourseRun: {
          key: 'course-v1:edX+DemoX+T2023',
        },
      },
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          redeemableSubsidyAccessPolicy: {},
        },
      ],
      expectedRedeemableSubsidyAccessPolicy: {},
    },
  ])('should resolve as expected for redeemableSubsidyAccessPolicy (%s)', async ({
    courseMetadata,
    canRedeemData,
    expectedRedeemableSubsidyAccessPolicy,
  }) => {
    useCourseMetadata.mockReturnValue({ data: courseMetadata });
    fetchCanRedeem.mockResolvedValue(canRedeemData);
    const { result } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.redeemableSubsidyAccessPolicy).toEqual(expectedRedeemableSubsidyAccessPolicy);
    });
  });
  it('should return the original and transformed data when select is passed', async () => {
    const { result } = renderHook(() => useCourseRedemptionEligibility({
      select: (data) => data,
    }), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.original).toEqual(mockCanRedeemData);
      expect(result.current.data.transformed).toEqual(mockExpectedUseCouseRedemptionEligibilityReturn);
    });
  });

  it.each([
    // Happy case, a restricted run is present in the course metadata AND it is
    // redeemble via learner credit according to can-redeem.
    {
      courseRunKey: null, // Simulate course about page.
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          contentKey: mockCourseRunKey,
          canRedeem: true,
        },
        {
          ...mockCanRedeemData[0],
          contentKey: `${mockCourseRunKey}-restricted`,
          canRedeem: true,
        },
      ],
      useCourseMetadataData: {
        ...mockCourseMetadata,
        availableCourseRuns: [
          mockCourseMetadata.availableCourseRuns[0],
          {
            ...mockCourseMetadata.availableCourseRuns[0],
            key: `${mockCourseRunKey}-restricted`,
            restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          },
        ],
      },
      expectedHasSuccessfulRedemption: false,
      expectedAvailableCourseRunKeys: [
        mockCourseRunKey,
        `${mockCourseRunKey}-restricted`,
      ],
    },
    // A restricted run is present in the course metadata but it is NOT
    // redeemble via the specific LC policy requested. This will happen very
    // often because learners should not be able to see restricted runs that
    // belong to customers to which they are not linked.
    {
      courseRunKey: null, // Simulate course about page.
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          contentKey: mockCourseRunKey,
          canRedeem: true,
        },
        {
          ...mockCanRedeemData[0],
          contentKey: `${mockCourseRunKey}-restricted`,
          canRedeem: false,
        },
      ],
      useCourseMetadataData: {
        ...mockCourseMetadata,
        availableCourseRuns: [
          mockCourseMetadata.availableCourseRuns[0],
          {
            ...mockCourseMetadata.availableCourseRuns[0],
            key: `${mockCourseRunKey}-restricted`,
            restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          },
        ],
      },
      expectedHasSuccessfulRedemption: false,
      expectedAvailableCourseRunKeys: [
        mockCourseRunKey,
      ],
    },
    // A restricted run is the only run for the course.
    // This should also happen very often because this is the primary intended
    // use case for restricted runs.
    {
      courseRunKey: null, // Simulate course about page.
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          contentKey: `${mockCourseRunKey}-restricted`,
          canRedeem: true,
        },
      ],
      useCourseMetadataData: {
        ...mockCourseMetadata,
        availableCourseRuns: [
          {
            ...mockCourseMetadata.availableCourseRuns[0],
            key: `${mockCourseRunKey}-restricted`,
            restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          },
        ],
      },
      expectedHasSuccessfulRedemption: false,
      expectedAvailableCourseRunKeys: [
        `${mockCourseRunKey}-restricted`,
      ],
    },
    // A restricted run is present in the course metadata but it is not of the
    // correct type of restriction.
    {
      courseRunKey: null, // Simulate course about page.
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          contentKey: mockCourseRunKey,
          canRedeem: true,
        },
        {
          ...mockCanRedeemData[0],
          contentKey: `${mockCourseRunKey}-restricted`,
          canRedeem: true,
        },
      ],
      useCourseMetadataData: {
        ...mockCourseMetadata,
        availableCourseRuns: [
          mockCourseMetadata.availableCourseRuns[0],
          {
            ...mockCourseMetadata.availableCourseRuns[0],
            key: `${mockCourseRunKey}-restricted`,
            restrictionType: 'other-restriction-type',
          },
        ],
      },
      expectedHasSuccessfulRedemption: false,
      expectedAvailableCourseRunKeys: [
        mockCourseRunKey,
      ],
    },
    // Make sure a restricted run still available even though it has been redeemed.
    {
      courseRunKey: null, // Simulate course about page.
      canRedeemData: [
        {
          ...mockCanRedeemData[0],
          contentKey: `${mockCourseRunKey}-restricted`,
          canRedeem: false, // Successfully redeemed content has canRedeem = false.
          // A successful redemption should cause the logic to deem this content available despite being non-redeemable.
          hasSuccessfulRedemption: true,
        },
      ],
      useCourseMetadataData: {
        ...mockCourseMetadata,
        availableCourseRuns: [
          {
            ...mockCourseMetadata.availableCourseRuns[0],
            key: `${mockCourseRunKey}-restricted`,
            restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          },
        ],
      },
      expectedHasSuccessfulRedemption: true,
      expectedAvailableCourseRunKeys: [
        `${mockCourseRunKey}-restricted`,
      ],
    },
  ])('should resolve as expected when restricted runs exist (%s)', async ({
    courseRunKey,
    canRedeemData,
    useCourseMetadataData,
    expectedHasSuccessfulRedemption,
    expectedAvailableCourseRunKeys,
  }) => {
    useParams.mockReturnValue({ courseRunKey });
    fetchCanRedeem.mockResolvedValue(canRedeemData);
    useCourseMetadata.mockReturnValue({ data: useCourseMetadataData });

    const { result } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current.data.hasSuccessfulRedemption).toEqual(expectedHasSuccessfulRedemption);
      expect(
        result.current.data.availableCourseRuns.map(run => run.key),
      ).toEqual(expectedAvailableCourseRunKeys);
    });
  });
});
