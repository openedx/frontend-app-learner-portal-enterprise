import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchBrowseAndRequestConfiguration, fetchCouponCodeRequests, fetchLicenseRequests } from '../services';
import useBrowseAndRequest, {
  useBrowseAndRequestConfiguration,
  useCouponCodeRequests,
  useSubscriptionLicenseRequests,
} from './useBrowseAndRequest';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchBrowseAndRequestConfiguration: jest.fn().mockResolvedValue(null),
  fetchLicenseRequests: jest.fn().mockResolvedValue(null),
  fetchCouponCodeRequests: jest.fn().mockResolvedValue(null),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockBrowseAndRequestConfiguration = {
  id: 123,
};
const mockLicenseRequests = ['test-license1', 'test-license2'];
const mockCouponCodeRequests = ['test-couponCode1, test-couponCode2'];

const Wrapper = ({ children }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <QueryClientProvider client={queryClient()}>
    <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
      {children}
    </AppContext.Provider>

  </QueryClientProvider>
);

describe('useBrowseAndRequestConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle resolved value correctly', async () => {
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    const { result, waitForNextUpdate } = renderHook(() => useBrowseAndRequestConfiguration(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockBrowseAndRequestConfiguration,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle rejected value correctly', async () => {
    const errorMessage = new Error('Test Error');
    fetchBrowseAndRequestConfiguration.mockRejectedValue(errorMessage);
    const { result, waitForNextUpdate } = renderHook(() => useBrowseAndRequestConfiguration(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        failureReason: errorMessage,
        isError: true,
      }),
    );
  });
});

describe('useSubscriptionLicenseRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle resolved value correctly', async () => {
    fetchLicenseRequests.mockResolvedValue(mockLicenseRequests);
    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicenseRequests(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockLicenseRequests,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle rejected value correctly', async () => {
    const errorMessage = new Error('Test Error');
    fetchLicenseRequests.mockRejectedValue(errorMessage);
    const { result, waitForNextUpdate } = renderHook(() => useSubscriptionLicenseRequests(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        failureReason: errorMessage,
        isError: true,
      }),
    );
  });
});

describe('useCouponCodeRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle resolved value correctly', async () => {
    fetchCouponCodeRequests.mockResolvedValue(mockCouponCodeRequests);
    const { result, waitForNextUpdate } = renderHook(() => useCouponCodeRequests(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockCouponCodeRequests,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle rejected value correctly', async () => {
    const errorMessage = new Error('Test Error');
    fetchCouponCodeRequests.mockRejectedValue(errorMessage);
    const { result, waitForNextUpdate } = renderHook(() => useCouponCodeRequests(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        failureReason: errorMessage,
        isError: true,
      }),
    );
  });
});

describe('useBrowseAndRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle resolved value correctly', async () => {
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue(mockLicenseRequests);
    fetchCouponCodeRequests.mockResolvedValue(mockCouponCodeRequests);

    const expectedValue = {
      configuration: mockBrowseAndRequestConfiguration,
      requests: {
        subscriptionLicenses: mockLicenseRequests,
        couponCodes: mockCouponCodeRequests,
      },
    };
    const { result, waitForNextUpdate } = renderHook(() => useBrowseAndRequest(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: expectedValue,
      }),
    );
  });
});
