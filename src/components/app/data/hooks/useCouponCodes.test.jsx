import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchCouponCodes } from '../services';
import useCouponCodes from './useCouponCodes';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCouponCodes: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockCouponCodes = {
  couponsOverview: [{ id: 'test-coupon-code' }],
  couponCodeAssignments: [{ id: 'test-coupon-code-assignment' }],
};

describe('useCouponCodes', () => {
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
    fetchCouponCodes.mockResolvedValue(mockCouponCodes);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useCouponCodes(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockCouponCodes,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
