import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCouponCodes } from '../queries';
import { hasValidStartExpirationDates } from '../../../../utils/common';

/**
 * Retrieves the coupon codes and transforms their data.
 * @returns {Types.UseQueryResult} The query results for the coupon codes.
 */
export default function useCouponCodes(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;
  return useQuery({
    ...queryCouponCodes(enterpriseCustomer.uuid),
    ...queryOptionsRest,
    select: (data) => {
      if (select) {
        return select(data);
      }
      const transformedResults = data.couponCodeAssignments.map((couponCode) => ({
        ...couponCode,
        available: hasValidStartExpirationDates({
          startDate: couponCode.couponStartDate,
          endDate: couponCode.couponEndDate,
        }),
      }));
      const transformedData = { ...data, couponCodeAssignments: transformedResults };
      return transformedData;
    },
  });
}
