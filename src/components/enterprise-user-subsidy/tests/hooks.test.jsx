import { renderHook } from '@testing-library/react-hooks';
import * as logging from '@edx/frontend-platform/logging';
import { useSubscriptionLicense } from '../data/hooks';
import {
  fetchSubscriptionLicensesForUser,
  activateLicense,
} from '../data/service';
import { LICENSE_STATUS } from '../data/constants';

jest.mock('../data/service');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const TEST_SUBSCRIPTION_UUID = 'test-subscription-uuid';
const TEST_LICENSE_UUID = 'test-license-uuid';
const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ACTIVATION_KEY = 'test-activation-key';

const mockEnterpriseConfig = {
  uuid: TEST_ENTERPRISE_UUID,
  enterpriseIdentityProvider: undefined,
};

const mockLicense = {
  uuid: TEST_LICENSE_UUID,
  status: LICENSE_STATUS.ASSIGNED,
  subscription_plan_uuid: TEST_SUBSCRIPTION_UUID,
  activation_key: TEST_ACTIVATION_KEY,
};

const mockSubscriptionPlan = { uuid: TEST_SUBSCRIPTION_UUID, is_active: true, title: 'title' };

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
    fetchSubscriptionLicensesForUser.mockResolvedValueOnce({
      data: {
        results: [mockLicense],
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicense({
      enterpriseConfig: mockEnterpriseConfig,
      customerAgreementConfig: {
        subscriptions: [mockSubscriptionPlan],
      },
      isLoadingCustomerAgreementConfig: false,
    }));
    await waitForNextUpdate();

    expect(fetchSubscriptionLicensesForUser).toHaveBeenCalledWith(TEST_ENTERPRISE_UUID);
    expect(result.current.license.subscriptionPlan).toEqual(mockSubscriptionPlan);
  });

  describe('activateUserLicense', () => {
    beforeEach(() => {
      fetchSubscriptionLicensesForUser.mockResolvedValue({
        data: {
          results: [mockLicense],
        },
      });
    });

    afterEach(() => jest.clearAllMocks());

    it('activates the user license and updates the license status', async () => {
      activateLicense.mockResolvedValueOnce(true);

      const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicense({
        enterpriseConfig: mockEnterpriseConfig,
        customerAgreementConfig: {
          subscriptions: [mockSubscriptionPlan],
        },
        isLoadingCustomerAgreementConfig: false,
      }));

      await waitForNextUpdate();

      const { activateUserLicense } = result.current;

      activateUserLicense();

      await waitForNextUpdate();

      expect(activateLicense).toHaveBeenCalledWith(mockLicense.activation_key);
      expect(result.current.license.status).toEqual(LICENSE_STATUS.ACTIVATED);
    });

    it('handles errors', async () => {
      const mockError = new Error('something went swrong');
      activateLicense.mockRejectedValueOnce(mockError);

      const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicense({
        enterpriseConfig: mockEnterpriseConfig,
        customerAgreementConfig: {
          subscriptions: [mockSubscriptionPlan],
        },
        isLoadingCustomerAgreementConfig: false,
      }));

      await waitForNextUpdate();

      const { activateUserLicense } = result.current;

      try {
        await activateUserLicense();
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      expect(activateLicense).toHaveBeenCalledWith(mockLicense.activation_key);
      expect(result.current.license.status).toEqual(LICENSE_STATUS.ASSIGNED);
      expect(logging.logError).toHaveBeenCalledWith(mockError);
    });
  });
});
