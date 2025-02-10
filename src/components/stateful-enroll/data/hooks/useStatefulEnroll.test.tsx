import { act, renderHook } from '@testing-library/react-hooks';
import { logError } from '@edx/frontend-platform/logging';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';

import useStatefulEnroll from './useStatefulEnroll';
import * as hooks from '../../../course/data/hooks';

import { submitRedemptionRequest } from '../service';
import { useEnterpriseCustomer } from '../../../app/data';
import { checkTransactionStatus } from '../../../app/data/services';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../app/data/services/data/__factories__';
import { queryClient } from '../../../../utils/tests';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

jest.mock('../../../app/data', () => ({
  ...jest.requireActual('../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../../app/data/services', () => ({
  ...jest.requireActual('../../../app/data/services'),
  checkTransactionStatus: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth');

jest.mock('../service', () => ({
  submitRedemptionRequest: jest.fn(),
}));

const useEnterpriseCustomerMock = useEnterpriseCustomer as jest.Mock;
const submitRedemptionRequestMock = submitRedemptionRequest as jest.Mock;
const checkTransactionStatusMock = checkTransactionStatus as jest.Mock;

const onBeginRedeem = jest.fn();
const onSuccess = jest.fn();
const onError = jest.fn();
const userEnrollments = [] as Types.EnterpriseCourseEnrollment[];

const trackSearchClick = jest.fn();
const optimizelyClick = jest.fn();
jest.spyOn(hooks, 'useTrackSearchConversionClickHandler').mockReturnValue(trackSearchClick);
jest.spyOn(hooks, 'useOptimizelyEnrollmentClickHandler').mockReturnValue(optimizelyClick);

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const mockSubsidyAccessPolicy: Types.SubsidyAccessPolicy = {
  uuid: 'mock-policy-uuid',
  policyRedemptionUrl: 'http://policy-redemption.url',
};
const mockCourseKey = 'edX+DemoX';
const mockCourseRunKey = 'course-v1:edX+DemoX+T2025';
const mockTransaction: Types.SubsidyTransaction = {
  uuid: 'mock-transaction-uuid',
  state: 'pending',
  lmsUserId: 3,
  contentKey: mockCourseRunKey,
  parentContentKey: mockCourseKey,
  contentTitle: 'Demo Course',
  quantity: 1,
  unit: 'usd',
  subsidyAccessPolicyUuid: mockSubsidyAccessPolicy.uuid,
  metadata: {},
  transactionStatusApiUrl: 'http://transaction-status.url',
  coursewareUrl: 'http://courseware.url',
  created: '2021-01-01T00:00:00Z',
  modified: '2021-01-01T00:00:00Z',
};

const wrapper = ({ children }) => (
  <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  </AppContext.Provider>
);

describe('useStatefulEnroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomerMock.mockReturnValue({ data: mockEnterpriseCustomer });
    submitRedemptionRequestMock.mockResolvedValue(mockTransaction);
    checkTransactionStatusMock.mockResolvedValue(mockTransaction);
  });

  const setupHook = (props = {}) => renderHook(() => useStatefulEnroll({
    contentKey: mockCourseRunKey,
    subsidyAccessPolicy: mockSubsidyAccessPolicy,
    onSuccess,
    onError,
    onBeginRedeem,
    userEnrollments,
    ...props,
  }), { wrapper });

  const testRedemptionFlow = async (finalState: Types.SubsidyTransactionState, callback: Function) => {
    checkTransactionStatusMock.mockResolvedValueOnce(mockTransaction); // pending
    checkTransactionStatusMock.mockResolvedValueOnce({ ...mockTransaction, state: finalState });
    const { result, waitFor } = setupHook();
    act(() => { result.current({ metadata: { foo: 'bar' } }); });
    await waitFor(() => expect(onBeginRedeem).toHaveBeenCalled());
    await waitFor(() => callback());
  };

  it('should return a redemption function', () => {
    const { result } = setupHook();
    expect(typeof result.current).toBe('function');
  });

  it('should log error if no subsidy access policy is provided', () => {
    const { result } = setupHook({ subsidyAccessPolicy: undefined });
    act(() => { result.current(); });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      `Redemption without subsidy access policy attempted by ${mockAuthenticatedUser.userId} for ${mockCourseRunKey}.`,
    );
    expect(onBeginRedeem).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should resolve a committed transaction upon redemption, calling onSuccess', async () => {
    await testRedemptionFlow('committed', () => {
      expect(optimizelyClick).toHaveBeenCalled();
      expect(trackSearchClick).toHaveBeenCalled();
      const expectedTransaction = { ...mockTransaction, state: 'committed' };
      expect(onSuccess).toHaveBeenCalledWith(expectedTransaction);
    });
  });

  it('should resolve a failed transaction upon redemption, calling onError', async () => {
    await testRedemptionFlow('failed', () => {
      expect(onError).toHaveBeenCalledTimes(1);
      const expectedError = new Error(`Transaction ${mockTransaction.uuid} failed during redemption.`);
      expect(onError).toHaveBeenCalledWith(new Error(`Transaction ${mockTransaction.uuid} failed during redemption.`));
      expect(onError).toHaveBeenCalledWith(expectedError);
    });
  });

  it.each([
    ['submitRedemptionRequest', submitRedemptionRequestMock],
    ['checkTransactionStatus', checkTransactionStatusMock],
  ])('should call onError if %s throws an error', async (_, mockFunction) => {
    const mockError = new Error('mock error');
    mockFunction.mockRejectedValueOnce(mockError);
    const { result, waitFor } = setupHook();
    act(() => { result.current(); });
    await waitFor(() => expect(onBeginRedeem).toHaveBeenCalled());
    await waitFor(() => expect(onError).toHaveBeenCalledWith(mockError));
  });
});
