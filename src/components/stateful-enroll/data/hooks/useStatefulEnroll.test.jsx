import { act, renderHook } from '@testing-library/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import useStatefulEnroll from './useStatefulEnroll';
import * as hooks from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';

import { submitRedemptionRequest } from '../service';
import { queryPolicyTransaction, useEnterpriseCustomer } from '../../../app/data';
import { enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
const mockTransactionStatusApiUrl = 'transaction_status_api_url';
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(mockTransactionStatusApiUrl).reply(200, {
  state: 'committed',
});

const mockMutateAsync = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({ mutateAsync: mockMutateAsync })),
  useQuery: jest.fn(),
}));

jest.mock('../service', () => ({
  submitRedemptionRequest: jest.fn(),
  retrieveTransactionStatus: jest.fn(),
}));

const onBeginRedeem = jest.fn();
const onSuccess = jest.fn();
const onError = jest.fn();
const userEnrollments = [];

const trackSearchClick = jest.fn();
const optimizelyClick = jest.fn();
const trackSearchSpy = jest.spyOn(hooks, 'useTrackSearchConversionClickHandler').mockReturnValue(trackSearchClick);
const optimizelySpy = jest.spyOn(hooks, 'useOptimizelyEnrollmentClickHandler').mockReturnValue(optimizelyClick);

const mockEnterpriseCustomer = enterpriseCustomerFactory();

describe('useStatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  const renderUseStatefulEnroll = async ({
    metadata,
    shouldThrowError = false,
    ...options
  } = {}) => {
    if (shouldThrowError) {
      mockMutateAsync.mockImplementation(() => {
        throw new Error('error');
      });
    }

    const wrapper = ({ children }) => (
      <AppContext.Provider value={{ authenticatedUser: { userId: 123 } }}>
        {children}
      </AppContext.Provider>
    );

    const { result } = renderHook(() => useStatefulEnroll({
      contentKey: 'content_key',
      subsidyAccessPolicy: {
        policyRedemptionUrl: 'policy_redemption_url',
      },
      onSuccess,
      onError,
      onBeginRedeem,
      userEnrollments,
      ...options,
    }), { wrapper });

    const { redeem } = result.current;
    await redeem({ metadata });

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: 123,
      contentKey: 'content_key',
      policyRedemptionUrl: 'policy_redemption_url',
      metadata,
    }, {
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });
  };

  test.each([
    { state: 'committed', isSuccess: true, metadata: undefined },
    { state: 'pending', isSuccess: false, metadata: undefined },
    { state: 'committed', isSuccess: true, metadata: { example: true } },
  ])('should call redemptionMutation.mutateAsync on redeem (%s)', async ({ state: mockState, isSuccess, metadata }) => {
    await renderUseStatefulEnroll({ metadata });

    const onSuccessHandler = mockMutateAsync.mock.calls[0][1].onSuccess;
    await act(() => onSuccessHandler({ state: mockState }));

    if (isSuccess) {
      expect(trackSearchSpy).toHaveBeenCalledWith({ eventName: EVENT_NAMES.sucessfulEnrollment });
      expect(optimizelySpy).toHaveBeenCalledWith({ courseRunKey: 'content_key', userEnrollments: [] });
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith({ state: mockState });
    } else {
      expect(onSuccess).toHaveBeenCalledTimes(0);
    }
  });

  test('should call onError on redeem error', async () => {
    await renderUseStatefulEnroll();

    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: 123,
      contentKey: 'content_key',
      policyRedemptionUrl: 'policy_redemption_url',
      metadata: undefined,
    }, {
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
    });

    const onErrorHandler = mockMutateAsync.mock.calls[0][1].onError;
    act(() => onErrorHandler(new Error('error')));

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(new Error('error'));
  });

  test('should call onBeginRedeem on mutate', async () => {
    await renderUseStatefulEnroll();

    expect(useMutation).toHaveBeenCalledTimes(1);
    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onMutate: expect.any(Function),
    });

    act(() => {
      const onMutateHandler = useMutation.mock.calls[0][0].onMutate;
      onMutateHandler();
    });
    expect(onBeginRedeem).toHaveBeenCalledTimes(1);
  });

  test('passes submitRedemptionRequest as the mutationFn', async () => {
    await renderUseStatefulEnroll();
    expect(useMutation).toHaveBeenCalledTimes(1);
    expect(useMutation).toHaveBeenCalledWith({
      mutationFn: submitRedemptionRequest,
      onMutate: expect.any(Function),
    });
    useMutation.mock.calls[0][0].mutationFn();
    expect(submitRedemptionRequest).toHaveBeenCalledTimes(1);
  });

  test.only('should call checkTransactionStatus', async () => {
    const mockTransaction = {
      state: 'pending',
      transactionStatusApiUrl: mockTransactionStatusApiUrl,
    };
    await renderUseStatefulEnroll();
    const onSuccessHandler = mockMutateAsync.mock.calls[0][1].onSuccess;
    await act(() => onSuccessHandler(mockTransaction));

    expect(onSuccess).toHaveBeenCalledTimes(0);

    expect(useQuery).toHaveBeenCalledTimes(2);
    const policyTransactionQueryKey = queryPolicyTransaction(mockEnterpriseCustomer.uuid, mockTransaction).queryKey;
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: policyTransactionQueryKey,
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Function),
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
      enabled: true,
    });
  });

  test.each([
    {
      transaction: { state: 'pending' },
      expectedEnabled: true,
      expectedRefetchInterval: 1000,
    },
    {
      transaction: { state: 'committed' },
      expectedEnabled: false,
      expectedRefetchInterval: false,
    },
    {
      transaction: { state: 'failed' },
      expectedEnabled: false,
      expectedRefetchInterval: false,
    },
  ])('should return correct refetchInterval (%s)', async ({ transaction, expectedEnabled, expectedRefetchInterval }) => {
    const mockTransaction = {
      ...transaction,
      transactionStatusApiUrl: mockTransactionStatusApiUrl,
    };
    await renderUseStatefulEnroll();
    const onSuccessHandler = mockMutateAsync.mock.calls[0][1].onSuccess;
    await act(() => onSuccessHandler(mockTransaction));
    expect(useQuery).toHaveBeenCalledTimes(2);
    const policyTransactionQueryKey = queryPolicyTransaction(mockEnterpriseCustomer.uuid, mockTransaction).queryKey;
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: policyTransactionQueryKey,
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Function),
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
      enabled: expectedEnabled,
    });

    // use the call to useQuery to get the refetchInterval
    const useQueryArgs = useQuery.mock.calls[0][0];
    const { refetchInterval } = useQueryArgs;
    expect(refetchInterval(mockTransaction)).toEqual(expectedRefetchInterval);
  });

  test('handles error when calling mutateAsync', async () => {
    await renderUseStatefulEnroll({ shouldThrowError: true });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
