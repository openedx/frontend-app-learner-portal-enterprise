import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCustomerContainsContent } from '../services';
import useEnterpriseCustomerContainsContent from './useEnterpriseCustomerContainsContent';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseCustomerContainsContent: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCustomerContainsContent = {
  containsContentItems: false,
  catalogList: [],
};

describe('useEnterpriseCustomerContainsContent', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCustomerContainsContent.mockResolvedValue(mockEnterpriseCustomerContainsContent);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useEnterpriseCustomerContainsContent(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockEnterpriseCustomerContainsContent,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
