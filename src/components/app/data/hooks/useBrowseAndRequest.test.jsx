import { renderHook, waitFor } from '@testing-library/react';
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
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useBrowseAndRequestConfiguration(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockBrowseAndRequestConfiguration,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});

describe('useSubscriptionLicenseRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchLicenseRequests.mockResolvedValue(mockLicenseRequests);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useSubscriptionLicenseRequests(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockLicenseRequests,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});

describe('useCouponCodeRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchCouponCodeRequests.mockResolvedValue(mockCouponCodeRequests);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useCouponCodeRequests(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockCouponCodeRequests,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});

describe('useBrowseAndRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchBrowseAndRequestConfiguration.mockResolvedValue(mockBrowseAndRequestConfiguration);
    fetchLicenseRequests.mockResolvedValue(mockLicenseRequests);
    fetchCouponCodeRequests.mockResolvedValue(mockCouponCodeRequests);
  });
  it('should handle resolved value correctly', async () => {
    const expectedValue = {
      configuration: mockBrowseAndRequestConfiguration,
      requests: {
        subscriptionLicenses: mockLicenseRequests,
        couponCodes: mockCouponCodeRequests,
      },
    };
    const { result } = renderHook(() => useBrowseAndRequest(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: expectedValue,
        }),
      );
    });
  });
});
