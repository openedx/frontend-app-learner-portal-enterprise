import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCustomerContainsContent } from '../services';
import { useEnterpriseCustomerContainsContentSuspense } from './useEnterpriseCustomerContainsContent';

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

describe('useEnterpriseCustomerContainsContentSuspense', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCustomerContainsContent.mockResolvedValue(mockEnterpriseCustomerContainsContent);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(
      () => useEnterpriseCustomerContainsContentSuspense(),
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockEnterpriseCustomerContainsContent,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
