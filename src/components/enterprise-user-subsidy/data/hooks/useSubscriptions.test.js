import { renderHook } from '@testing-library/react-hooks';

import useSubscriptions from './useSubscriptions';

import { useCustomerAgreementData, useSubscriptionLicense } from './hooks';

jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useCustomerAgreementData: jest.fn(),
  useSubscriptionLicense: jest.fn(),
}));

const mockCustomerAgreement = {
  uuid: 'test-customer-agreement-uuid',
  disableExpirationNotifications: false,
};
const mockSubscriptionPlan = { uuid: 'test-subscription-plan-uuid' };

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
      activateUserLicense: jest.fn(),
    });

    const args = {
      authenticatedUser: {},
      enterpriseConfig: {},
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
    },
    {
      hasDisabledExpirationNotifications: true,
      expectedShowExpirationNotifications: false,
    },
  ])('does stuff', async ({
    hasDisabledExpirationNotifications,
    expectedShowExpirationNotifications,
  }) => {
    const anotherMockCustomerAgreement = {
      ...mockCustomerAgreement,
      disableExpirationNotifications: hasDisabledExpirationNotifications,
    };
    const mockSubscriptionLicense = {
      uuid: 'test-license-uuid',
      subscriptionPlan: mockSubscriptionPlan,
    };
    useCustomerAgreementData.mockReturnValue([anotherMockCustomerAgreement, false]);
    useSubscriptionLicense.mockReturnValue({
      license: mockSubscriptionLicense,
      isLoading: false,
      activateUserLicense: jest.fn(),
    });
    const args = {
      authenticatedUser: {},
      enterpriseConfig: {},
    };
    const { result } = renderHook(() => useSubscriptions(args));
    expect(result.current).toEqual(
      expect.objectContaining({
        activateUserLicense: expect.any(Function),
        customerAgreementConfig: anotherMockCustomerAgreement,
        isLoading: false,
        subscriptionLicense: mockSubscriptionLicense,
        subscriptionPlan: mockSubscriptionPlan,
        showExpirationNotifications: expectedShowExpirationNotifications,
      }),
    );
  });
});
