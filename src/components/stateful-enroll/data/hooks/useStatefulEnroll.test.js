import { act, renderHook } from '@testing-library/react-hooks';
import { useMutation, useQuery } from '@tanstack/react-query';

import useStatefulEnroll from './useStatefulEnroll';
import * as hooks from '../../../course/data/hooks';
import { EVENT_NAMES } from '../../../course/data/constants';

import { retrieveTransactionStatus, submitRedemptionRequest } from '../service';
import { enterpriseUserSubsidyQueryKeys } from '../../../enterprise-user-subsidy/data/constants';

const mockMutateAsync = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({ mutateAsync: mockMutateAsync })),
  useQuery: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ id: 123 })),
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

describe('useStatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    }));

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
      expect(optimizelySpy).toHaveBeenCalledWith('content_key', []);
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

  test('should call retrieveTransactionStatus on checkTransactionStatus', async () => {
    await renderUseStatefulEnroll();

    const mockTransaction = {
      state: 'pending',
      transactionStatusApiUrl: 'transaction_status_api_url',
    };

    const onSuccessHandler = mockMutateAsync.mock.calls[0][1].onSuccess;
    await act(() => onSuccessHandler(mockTransaction));

    expect(onSuccess).toHaveBeenCalledTimes(0);

    expect(useQuery).toHaveBeenCalledTimes(2);
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [...enterpriseUserSubsidyQueryKeys.policy(), 'transactions', mockTransaction],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Function),
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
      enabled: true,
    });

    // use the second call to useQuery to get the queryFn
    const useQueryArgs = useQuery.mock.calls[1][0];
    const { queryFn } = useQueryArgs;
    await queryFn({ queryKey: useQueryArgs.queryKey });

    expect(retrieveTransactionStatus).toHaveBeenCalledTimes(1);
    expect(retrieveTransactionStatus).toHaveBeenCalledWith({
      transactionStatusApiUrl: mockTransaction.transactionStatusApiUrl,
    });
  });

  test.each([
    { state: 'pending', expected: 1000 },
    { state: 'committed', expected: false },
    { state: 'failed', expected: false },
  ])('should return correct refetchInterval (%s)', async ({ state, expected }) => {
    await renderUseStatefulEnroll();

    const mockTransaction = { state };

    expect(useQuery).toHaveBeenCalledTimes(1);
    expect(useQuery).toHaveBeenCalledWith({
      // undefined here is expected, as we're testing before the redemption mutation has resolved
      queryKey: [...enterpriseUserSubsidyQueryKeys.policy(), 'transactions', undefined],
      queryFn: expect.any(Function),
      refetchInterval: expect.any(Function),
      onSuccess: expect.any(Function),
      onError: expect.any(Function),
      enabled: false,
    });

    // use the second call to useQuery to get the refetchInterval
    const useQueryArgs = useQuery.mock.calls[0][0];
    const { refetchInterval } = useQueryArgs;
    expect(refetchInterval(mockTransaction)).toEqual(expected);
  });

  test('handles error when calling mutateAsync', async () => {
    await renderUseStatefulEnroll({ shouldThrowError: true });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
