import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCouponCodes } from '../app/data';
import { hasValidStartExpirationDates } from '../../utils/common';

export default function useCouponCodes() {
  const { uuid } = useEnterpriseCustomer();
  const { data: couponCodesData } = useQuery(queryCouponCodes(uuid));
  const transformedResults = couponCodesData.couponCodeAssignments.results.map((couponCode) => ({
    ...couponCode,
    available: hasValidStartExpirationDates({
      startDate: couponCode.couponStartDate,
      endDate: couponCode.couponEndDate,
    }),
  }));
  console.log(transformedResults)
  return {
    ...couponCodesData,
    couponCodes: transformedResults,
  };
}
