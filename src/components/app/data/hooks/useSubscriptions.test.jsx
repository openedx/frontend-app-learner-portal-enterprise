import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import { queryClient } from '../../../../utils/tests';
import { fetchSubscriptions } from '../services';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useSubscriptions from './useSubscriptions';
import { LICENSE_STATUS } from '../../../enterprise-user-subsidy/data/constants';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchSubscriptions: jest.fn().mockResolvedValue(null),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const licensesByStatus = {
  [LICENSE_STATUS.ACTIVATED]: [],
  [LICENSE_STATUS.ASSIGNED]: [],
  [LICENSE_STATUS.REVOKED]: [],
};
const mockSubscriptionsData = {
  subscriptionLicenses: [],
  customerAgreement: null,
  subscriptionLicense: null,
  subscriptionPlan: null,
  licensesByStatus,
  showExpirationNotifications: false,
  shouldShowActivationSuccessMessage: false,
};

describe('useSubscriptions', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchSubscriptions.mockResolvedValue(mockSubscriptionsData);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSubscriptions(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockSubscriptionsData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
