import { renderHook } from '@testing-library/react-hooks';
import { useSubscriptionLicense } from '../data/hooks';
import {
  fetchSubscriptionLicensesForUser,
} from '../data/service';
import { LICENSE_STATUS } from '../data/constants';

jest.mock('../data/service');

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const mockEnterpriseConfig = {
  uuid: TEST_ENTERPRISE_UUID,
  enterpriseIdentityProvider: undefined,
};

describe('useSubscriptionLicense', () => {
  it('does nothing if customer agreement is still loading', async () => {
    renderHook(() => useSubscriptionLicense({
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: undefined,
      isLoadingCustomerAgreementConfig: true,
    }));
    expect(fetchSubscriptionLicensesForUser).not.toHaveBeenCalled();
  });

  it('fetches user license if customer agreement is finished loading', async () => {
    const { waitForNextUpdate } = renderHook(() => useSubscriptionLicense({
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: undefined,
      isLoadingCustomerAgreementConfig: false,
    }));
    await waitForNextUpdate();
    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
  });

  it('sets the subscription plan object on the user license', async () => {
    const mockLicense = {
      uuid: TEST_LICENSE_UUID,
      status: LICENSE_STATUS.ACTIVATED,
      subscription_plan_uuid: TEST_SUBSCRIPTION_UUID,
    };

    const mockSubscriptionPlan = { uuid: TEST_SUBSCRIPTION_UUID, is_active: true, title: 'title' };

    fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
      data: {
        results: [mockLicense],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicense({
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: {
        subscriptions: [mockSubscriptionPlan,
        ],
      },
      isLoadingCustomerAgreementConfig: false,
    }));
    await waitForNextUpdate();

    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(result.current[0].subscriptionPlan).toEqual(mockSubscriptionPlan);
  });
});
