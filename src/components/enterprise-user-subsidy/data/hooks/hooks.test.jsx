import { renderHook } from '@testing-library/react-hooks';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';

import {
  useCouponCodes,
  useCustomerAgreementData,
  useSubscriptionLicense,
  useRedeemableLearnerCreditPolicies,
} from '.';
import {
  fetchSubscriptionLicensesForUser,
  fetchCustomerAgreementData,
  fetchRedeemableLearnerCreditPolicies,
} from '../service';
import { fetchCouponsOverview } from '../../coupons/data/service';
import { fetchCouponCodeAssignments } from '../../coupons';
import { LICENSE_STATUS } from '../constants';
import { ASSIGNMENT_TYPES } from '../../enterprise-offers/data/constants';

jest.mock('../../data/service');
jest.mock('../../coupons/data/service');
jest.mock('../../coupons');

jest.mock('../../../../config', () => ({
  ...jest.requireActual('../../../../config'),
  features: {
    ENABLE_AUTO_APPLIED_LICENSES: true,
    ENROLL_WITH_CODES: true,
  },
}));

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_USER_ID = '35';
const TEST_ACTIVATION_KEY = 'test-activation-key';

const mockEnterpriseConfig = {
  uuid: TEST_ENTERPRISE_UUID,
  identityProvider: undefined,
};
const mockLicense = {
  uuid: TEST_LICENSE_UUID,
  status: LICENSE_STATUS.ASSIGNED,
  subscription_plan_uuid: TEST_SUBSCRIPTION_UUID,
  activation_key: TEST_ACTIVATION_KEY,
};
const mockSubscriptionPlan = { uuid: TEST_SUBSCRIPTION_UUID, is_active: true, title: 'title' };
const mockLearnerCreditPolicy = {
  uuid: '3a93089e-9ff6-4d70-88d5-71c9cda7ce12',
  policy_redemption_url: 'http://localhost:18270/api/v1/policy-redemption/3a93089e-9ff6-4d70-88d5-71c9cda7ce12/redeem/',
  remaining_balance_per_user: 500,
  remaining_balance: 50000,
  subsidy_expiration_date: '2030-01-01 12:00:00Z',
  policy_type: 'PerLearnerEnrollmentCreditAccessPolicy',
  enterprise_customer_uuid: 'd0a6c526-670b-4991-b213-83f7b1216f29',
  description: 'test Subsidy policy',
  active: true,
  catalog_uuid: '8e353fcc-b623-4912-85ee-1f0d045c6d1c',
  subsidy_uuid: '8e353fcc-b623-4912-85ee-1f0d045c6d1c',
  access_method: 'direct',
  spend_limit: 5000,
  per_learner_enrollment_limit: 10,
  per_learner_spend_limit: 1500,
  learner_content_assignments: undefined,
};
const mockUser = { roles: [] };
const mockCustomerAgreement = {
  uuid: 'test-customer-agreement-uuid',
};

describe('useSubscriptionLicense', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing if customer agreement is still loading', async () => {
    const args = {
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: undefined,
      isLoadingCustomerAgreementConfig: true,
    };
    renderHook(() => useSubscriptionLicense(args));
    expect(fetchSubscriptionLicensesForUser).not.toHaveBeenCalled();
  });

  it('fetches user license if customer agreement is finished loading', async () => {
    const args = {
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: undefined,
      isLoadingCustomerAgreementConfig: false,
      user: mockUser,
    };
    const { waitForNextUpdate } = renderHook(() => useSubscriptionLicense(args));
    await waitForNextUpdate();
    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
  });

  it('sets the subscription plan object on the user license', async () => {
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
      data: {
        results: [mockLicense],
      },
    });

    const args = {
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: {
        subscriptions: [mockSubscriptionPlan],
      },
      isLoadingCustomerAgreementConfig: false,
      user: mockUser,
    };
    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicense(args));
    await waitForNextUpdate();

    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(result.current.license.subscriptionPlan).toEqual(mockSubscriptionPlan);
  });
});

describe('useCouponCodes', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );

  it('fetches coupons for enterprise and assigned codes for learner', async () => {
    const mockCoupons = [{ id: 'test-coupon-id' }];
    fetchCouponsOverview.mockResolvedValueOnce({
      data: { results: mockCoupons },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useCouponCodes(TEST_ENTERPRISE_UUID),
      { wrapper: Wrapper },
    );
    expect(result.current[0]).toEqual(
      expect.objectContaining({
        loading: true,
        couponCodes: [],
        couponCodesCount: 0,
        couponsOverview: expect.objectContaining({
          data: undefined,
          isLoading: true,
        }),
        error: null,
      }),
    );

    expect(fetchCouponsOverview).toHaveBeenCalledTimes(1);
    expect(fetchCouponsOverview).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_UUID,
    });

    expect(fetchCouponCodeAssignments).toHaveBeenCalledTimes(1);
    expect(fetchCouponCodeAssignments).toHaveBeenCalledWith(
      expect.objectContaining({
        enterprise_uuid: TEST_ENTERPRISE_UUID,
        full_discount_only: 'True',
        is_active: 'True',
      }),
      expect.any(Function),
    );

    await waitForNextUpdate();

    expect(result.current[0]).toEqual(
      expect.objectContaining({
        loading: false,
        couponCodes: [],
        couponCodesCount: 0,
        couponsOverview: expect.objectContaining({
          data: { results: mockCoupons },
          isLoading: false,
        }),
        error: null,
      }),
    );
  });
});

describe('useCustomerAgreementData', () => {
  it('fetches customer agreement data for enterprise', async () => {
    fetchCustomerAgreementData.mockResolvedValueOnce({
      data: { results: [mockCustomerAgreement] },
    });
    const { result, waitForNextUpdate } = renderHook(() => useCustomerAgreementData(TEST_ENTERPRISE_UUID));
    expect(result.current).toEqual([
      undefined,
      true, // isLoading
    ]);
    await waitForNextUpdate();
    expect(result.current).toEqual([
      mockCustomerAgreement,
      false, // isLoading
    ]);
  });

  it('handles no customer agreement data for enterprise', async () => {
    jest.mock('@edx/frontend-platform/logging', () => ({
      logError: jest.fn(),
    }));
    fetchCustomerAgreementData.mockResolvedValueOnce({
      data: { results: [] },
    });
    const { result, waitForNextUpdate } = renderHook(() => useCustomerAgreementData(TEST_ENTERPRISE_UUID));
    expect(result.current).toEqual([
      undefined,
      true, // isLoading
    ]);
    await waitForNextUpdate();
    expect(result.current).toEqual([
      null,
      false, // isLoading
    ]);
  });

  it('handles errors in fetching customer agreement data', async () => {
    const mockError = new Error('error');
    fetchCustomerAgreementData.mockRejectedValueOnce(mockError);

    const { result, waitForNextUpdate } = renderHook(() => useCustomerAgreementData(TEST_ENTERPRISE_UUID));

    expect(result.current).toEqual([undefined, true]);

    await waitForNextUpdate();

    expect(result.current).toEqual([null, false]);
    expect(logError).toHaveBeenCalledWith(new Error(mockError));
  });
});

const Wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useRedeemableLearnerCreditPolicies', () => {
  it('fetches and returns redeemable learner credit policies', async () => {
    const mockBaseAssignment = {
      uuid: 'test-assignment-uuid',
      subsidyExpirationDate: camelCaseObject(mockLearnerCreditPolicy).subsidyExpirationDate,
    };
    const mockAllocatedAssignment = {
      ...mockBaseAssignment,
      state: ASSIGNMENT_TYPES.ALLOCATED,
    };
    const mockCanceledAssignment = {
      ...mockBaseAssignment,
      state: ASSIGNMENT_TYPES.CANCELED,
    };
    const mockAcceptedAssignment = {
      ...mockBaseAssignment,
      state: ASSIGNMENT_TYPES.ACCEPTED,
    };
    const mockExpiredAssignment = {
      ...mockBaseAssignment,
      state: ASSIGNMENT_TYPES.EXPIRED,
    };
    const mockErroredAssignment = {
      ...mockBaseAssignment,
      state: ASSIGNMENT_TYPES.ERRORED,
    };
    const mockAssignablePolicy = {
      ...mockLearnerCreditPolicy,
      learnerContentAssignments: [
        mockAllocatedAssignment,
        mockCanceledAssignment,
        mockAcceptedAssignment,
        mockExpiredAssignment,
        mockErroredAssignment,
      ],
    };
    fetchRedeemableLearnerCreditPolicies.mockResolvedValueOnce({
      data: [mockLearnerCreditPolicy, mockAssignablePolicy],
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useRedeemableLearnerCreditPolicies(TEST_ENTERPRISE_UUID, TEST_USER_ID),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();
    expect(fetchRedeemableLearnerCreditPolicies).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID, TEST_USER_ID);

    expect(result.current.data).toEqual({
      redeemablePolicies: [
        camelCaseObject(mockLearnerCreditPolicy),
        camelCaseObject({
          ...mockAssignablePolicy,
          learnerContentAssignments: [
            mockAllocatedAssignment,
            mockCanceledAssignment,
            mockAcceptedAssignment,
            mockExpiredAssignment,
            mockErroredAssignment,
          ],
        }),
      ],
      learnerContentAssignments: {
        assignments: [
          mockAllocatedAssignment,
          mockCanceledAssignment,
          mockAcceptedAssignment,
          mockExpiredAssignment,
          mockErroredAssignment,
        ],
        hasAssignments: true,
        allocatedAssignments: [mockAllocatedAssignment],
        hasAllocatedAssignments: true,
        canceledAssignments: [mockCanceledAssignment],
        hasCanceledAssignments: true,
        expiredAssignments: [mockExpiredAssignment],
        hasExpiredAssignments: true,
        acceptedAssignments: [mockAcceptedAssignment],
        hasAcceptedAssignments: true,
        erroredAssignments: [mockErroredAssignment],
        hasErroredAssignments: true,
        assignmentsForDisplay: [
          mockAllocatedAssignment,
          mockCanceledAssignment,
          mockExpiredAssignment,
        ],
        hasAssignmentsForDisplay: true,
      },
    });
  });
});
