import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchCanRedeem } from '../services';
import useCourseMetadata from './useCourseMetadata';
import { useCourseRedemptionEligibility, useLateRedemptionBufferDays } from './index';
import { transformCourseRedemptionEligibility } from './useCourseRedemptionEligibility';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useCourseMetadata');
jest.mock('./useLateRedemptionBufferDays');
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
  courseRuns: [{
    key: mockCourseRunKey,
    isMarketable: true,
    availability: 'Current',
    enrollmentStart: dayjs().add(10, 'day').toISOString(),
    enrollmentEnd: dayjs().add(15, 'day').toISOString(),
    isEnrollable: true,
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
    useLateRedemptionBufferDays.mockReturnValue(undefined);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockExpectedUseCouseRedemptionEligibilityReturn,
        isLoading: false,
        isFetching: false,
      }),
    );
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

    const { result, waitForNextUpdate } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current.data.hasSuccessfulRedemption).toEqual(expectedHasSuccessfulRedemption);
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
    const { result, waitForNextUpdate } = renderHook(() => useCourseRedemptionEligibility(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current.data.redeemableSubsidyAccessPolicy).toEqual(expectedRedeemableSubsidyAccessPolicy);
  });
  it('should return the original and transformed data when select is passed', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCourseRedemptionEligibility({
      select: (data) => data,
    }), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current.data.original).toEqual(mockCanRedeemData);
    expect(result.current.data.transformed).toEqual(mockExpectedUseCouseRedemptionEligibilityReturn);
  });
});
