import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';
import * as logging from '@edx/frontend-platform/logging';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import useStatefulEnroll from './useStatefulEnroll';
import * as hooks from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';
import { useEnterpriseCustomer } from '../../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { queryClient } from '../../../../utils/tests';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
const mockPolicyRedemptionUrl = 'policy_redemption_url';
const mockTransactionStatusApiUrl = 'transaction_status_api_url';
const mockTransactionUuid = 'mock-transaction-uuid';
getAuthenticatedHttpClient.mockReturnValue(axios);

const onBeginRedeem = jest.fn();
const onSuccess = jest.fn();
const onError = jest.fn();
const userEnrollments = [];

const trackSearchClick = jest.fn();
const optimizelyClick = jest.fn();
const trackSearchSpy = jest.spyOn(hooks, 'useTrackSearchConversionClickHandler').mockReturnValue(trackSearchClick);
const optimizelySpy = jest.spyOn(hooks, 'useOptimizelyEnrollmentClickHandler').mockReturnValue(optimizelyClick);

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const mockContentKey = 'content_key';

type RedeemWithUseStatefulEnrollArgs = {
  hasSubsidyAccessPolicy?: boolean;
  metadata?: Record<string, unknown>;
  shouldThrowError?: boolean;
};

describe('useStatefulEnroll', () => {
  function mockRedemptionWithState(transactionState: SubsidyTransactionState) {
    axiosMock.onPost(mockPolicyRedemptionUrl).replyOnce(200, {
      uuid: mockTransactionUuid,
      state: transactionState,
      transactionStatusApiUrl: mockTransactionStatusApiUrl,
    });
  }

  function mockTransactionStates(transactionStates: SubsidyTransactionState[]) {
    transactionStates.forEach((state) => {
      axiosMock.onGet(mockTransactionStatusApiUrl).replyOnce(200, {
        uuid: mockTransactionUuid,
        state,
        transactionStatusApiUrl: mockTransactionStatusApiUrl,
      });
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (useEnterpriseCustomer as jest.Mock).mockReturnValue({ data: mockEnterpriseCustomer });
  });

  afterEach(() => {
    axiosMock.reset();
  });

  afterAll(() => {
    axiosMock.restore();
  });

  const redeemWithUseStatefulEnroll = async ({
    hasSubsidyAccessPolicy = true,
    metadata,
  }: RedeemWithUseStatefulEnrollArgs = {}) => {
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient()}>
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          {children}
        </AppContext.Provider>
      </QueryClientProvider>
    );

    const subsidyAccessPolicy: SubsidyAccessPolicy | undefined = hasSubsidyAccessPolicy
      ? {
        uuid: 'policy_uuid',
        policyRedemptionUrl: mockPolicyRedemptionUrl,
      }
      : undefined;

    const { result } = renderHook(() => useStatefulEnroll({
      contentKey: mockContentKey,
      subsidyAccessPolicy,
      onSuccess,
      onError,
      onBeginRedeem,
      userEnrollments,
    }), { wrapper });

    const redeem = result.current;
    if (metadata) {
      await redeem({ metadata });
    } else {
      await redeem();
    }
  };

  test('should logError when redeem is called without subsidy access policy', async () => {
    const logErrorSpy = jest.spyOn(logging, 'logError').mockImplementation(() => {});
    await redeemWithUseStatefulEnroll({ hasSubsidyAccessPolicy: false });
    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `Redemption without subsidy access policy attempted by ${mockAuthenticatedUser.userId} for ${mockContentKey}.`,
      ),
    );
  });

  test.each([
    { hasRedemptionMetadata: true },
    { hasRedemptionMetadata: false },
  ])('should make redemption request and poll for committed transaction (%s)', async ({ hasRedemptionMetadata }) => {
    mockRedemptionWithState('pending');
    mockTransactionStates(['pending', 'committed']);
    await redeemWithUseStatefulEnroll({
      metadata: hasRedemptionMetadata ? { mock: 'data' } : undefined,
    });

    expect(onBeginRedeem).toHaveBeenCalledTimes(1);

    // Ensure the first POST request to mockPolicyRedemptionUrl was made
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toBe(mockPolicyRedemptionUrl);

    // Wait for the initial GET request to mockTransactionStatusApiUrl (still pending)
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(mockTransactionStatusApiUrl);
    });

    // Wait for the second GET request to mockTransactionStatusApiUrl (now committed)
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(2);
      expect(axiosMock.history.get[1].url).toBe(mockTransactionStatusApiUrl);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({
      uuid: mockTransactionUuid,
      state: 'committed',
      transactionStatusApiUrl: mockTransactionStatusApiUrl,
    } as SubsidyTransaction);

    expect(trackSearchSpy).toHaveBeenCalledWith({ eventName: EVENT_NAMES.sucessfulEnrollment });
    expect(optimizelySpy).toHaveBeenCalledWith({ courseRunKey: 'content_key', userEnrollments: [] });
  });

  test('should handle redemption request with failed transaction', async () => {
    mockRedemptionWithState('pending');
    mockTransactionStates(['failed']);
    axiosMock.onGet(mockTransactionStatusApiUrl).replyOnce(200, {
      uuid: mockTransactionUuid,
      state: 'failed',
      transactionStatusApiUrl: mockTransactionStatusApiUrl,
    } as SubsidyTransaction);
    await redeemWithUseStatefulEnroll();

    expect(onBeginRedeem).toHaveBeenCalledTimes(1);

    // Ensure the first POST request to mockPolicyRedemptionUrl was made
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].url).toBe(mockPolicyRedemptionUrl);

    // Wait for the initial GET request to mockTransactionStatusApiUrl (still pending)
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
      expect(axiosMock.history.get[0].url).toBe(mockTransactionStatusApiUrl);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      const expectedError = new Error(`Transaction ${mockTransactionUuid} failed during redemption.`);
      expect(onError).toHaveBeenCalledWith(expectedError);
    });
  });

  test('should handle redemption request error', async () => {
    axiosMock.onPost(mockPolicyRedemptionUrl).replyOnce(500);
    await redeemWithUseStatefulEnroll();

    expect(onBeginRedeem).toHaveBeenCalledTimes(1);
    expect(axiosMock.history.post).toHaveLength(1);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  test('should handle transaction status request error', async () => {
    mockRedemptionWithState('pending');
    axiosMock.onGet(mockTransactionStatusApiUrl).replyOnce(500);
    await redeemWithUseStatefulEnroll();

    expect(onBeginRedeem).toHaveBeenCalledTimes(1);
    expect(axiosMock.history.post).toHaveLength(1);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
