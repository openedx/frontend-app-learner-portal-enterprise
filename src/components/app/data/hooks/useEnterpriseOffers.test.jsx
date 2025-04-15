import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseOffers } from '../services';
import useEnterpriseOffers from './useEnterpriseOffers';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseOffers: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseOffers = [{
  discount_value: 100,
  end_datetime: '2023-01-06T00:00:00Z',
  enterprise_catalog_uuid: 'uuid',
  id: 1,
  max_discount: 200,
  remaining_balance: 200,
  start_datetime: '2022-06-09T00:00:00Z',
  usage_type: 'Percentage',
  is_current: true,
}];

describe('useEnterpriseOffers', () => {
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
    fetchEnterpriseOffers.mockResolvedValue(mockEnterpriseOffers);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useEnterpriseOffers(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockEnterpriseOffers,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
