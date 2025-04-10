import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCouponCodes } from '../queries';

/**
 * Retrieves the coupon codes and transforms their data.
 * @returns The query results for the coupon codes.
 */
export default function useCouponCodes(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryCouponCodes(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
