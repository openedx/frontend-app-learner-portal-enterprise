import { renderHook } from '@testing-library/react-hooks';

import useSubscriptions from './useSubscriptions';
import { useCustomerAgreementData, useSubscriptionLicense } from './hooks';
import { hasValidStartExpirationDates } from '../../../../utils/common';

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useCustomerAgreementData: jest.fn(),
  useSubscriptionLicense: jest.fn(),
}));

jest.mock('../../../../utils/common', () => ({
  ...jest.requireActual('../../../../utils/common'),
  hasValidStartExpirationDates: jest.fn(),
}));

const mockCustomerAgreement = {
  uuid: 'test-customer-agreement-uuid',
  disableExpirationNotifications: false,
};
const mockSubscriptionPlan = { uuid: 'test-subscription-plan-uuid', isCurrent: true };

describe('useSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      isLoadingCustomerAgreement: false,
      isLoadingLicense: false,
      expectedLoadingState: false,
    },
    {
      isLoadingCustomerAgreement: false,
      isLoadingLicense: true,
      expectedLoadingState: true,
    },
    {
      isLoadingCustomerAgreement: true,
      isLoadingLicense: false,
      expectedLoadingState: true,
    },
    {
      isLoadingCustomerAgreement: true,
      isLoadingLicense: true,
      expectedLoadingState: true,
    },
  ])('handles loading states (%s)', ({
    isLoadingCustomerAgreement,
    isLoadingLicense,
    expectedLoadingState,
  }) => {
    useCustomerAgreementData.mockReturnValue([undefined, isLoadingCustomerAgreement]);
    useSubscriptionLicense.mockReturnValue({
      license: undefined,
      isLoading: isLoadingLicense,
    });

    const args = {
      authenticatedUser: {},
      enterpriseCustomer: {},
    };
    const { result } = renderHook(() => useSubscriptions(args));
    expect(result.current).toEqual(
      expect.objectContaining({
        isLoading: expectedLoadingState,
      }),
    );
  });

  it.each([
    {
      hasDisabledExpirationNotifications: false,
      expectedShowExpirationNotifications: true,
      isSubscriptionPlanCurrent: true,
    },
    {
      hasDisabledExpirationNotifications: true,
      expectedShowExpirationNotifications: false,
      isSubscriptionPlanCurrent: true,
    },
  ])('does stuff (%s)', async ({
    hasDisabledExpirationNotifications,
    expectedShowExpirationNotifications,
    isSubscriptionPlanCurrent,
  }) => {
    const anotherMockCustomerAgreement = {
      ...mockCustomerAgreement,
      disableExpirationNotifications: hasDisabledExpirationNotifications,
    };
    const mockSubscriptionPlanWithCurrentStatus = {
      ...mockSubscriptionPlan,
      isCurrent: isSubscriptionPlanCurrent,
    };
    const mockSubscriptionLicense = {
      uuid: 'test-license-uuid',
      subscriptionPlan: mockSubscriptionPlanWithCurrentStatus,
    };
    useCustomerAgreementData.mockReturnValue([anotherMockCustomerAgreement, false]);
    useSubscriptionLicense.mockReturnValue({
      license: mockSubscriptionLicense,
      isLoading: false,
    });
    hasValidStartExpirationDates.mockReturnValue(isSubscriptionPlanCurrent);
    const args = {
      authenticatedUser: {},
      enterpriseCustomer: {},
    };
    const { result } = renderHook(() => useSubscriptions(args));
    expect(result.current).toEqual(
      expect.objectContaining({
        customerAgreementConfig: anotherMockCustomerAgreement,
        isLoading: false,
        subscriptionLicense: mockSubscriptionLicense,
        subscriptionPlan: mockSubscriptionPlanWithCurrentStatus,
        showExpirationNotifications: expectedShowExpirationNotifications,
      }),
    );
  });
});
