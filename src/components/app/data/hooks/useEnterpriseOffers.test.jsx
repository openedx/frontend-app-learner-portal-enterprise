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

const mockDeprecatedReturn = {
  enterpriseOffers: [],
  currentEnterpriseOffers: [],
  canEnrollWithEnterpriseOffers: false,
  hasCurrentEnterpriseOffers: false,
  hasLowEnterpriseOffersBalance: false,
  hasNoEnterpriseOffersBalance: true,
};

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
    fetchEnterpriseOffers.mockResolvedValue(mockDeprecatedReturn);
  });
  it('should handle resolved value correctly related to deprecation', async () => {
    const { result } = renderHook(() => useEnterpriseOffers(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockDeprecatedReturn,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
