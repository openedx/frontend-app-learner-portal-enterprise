import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCouponCodes } from '../queries';
import { hasValidStartExpirationDates } from '../../../../utils/common';

export default function useCouponCodes() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryCouponCodes(enterpriseCustomer.uuid),
    select: (data) => {
      const transformedResults = data.couponCodeAssignments.map((couponCode) => ({
        ...couponCode,
        available: hasValidStartExpirationDates({
          startDate: couponCode.couponStartDate,
          endDate: couponCode.couponEndDate,
        }),
      }));
      return {
        ...data,
        couponCodeAssignments: transformedResults,
      };
    },
  });
}
