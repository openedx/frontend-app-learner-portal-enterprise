import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCouponCodes } from '../queries';

type UseCouponCodesQueryOptions<TData = unknown, TSelectData = TData> = {
  select?: (data: TData) => TSelectData;
};

/**
 * Retrieves the coupon codes and transforms their data.
 * @returns The query results for the coupon codes.
 */
export default function useCouponCodes<TData = CouponCodes, TSelectData = TData>(
  options: UseCouponCodesQueryOptions<TData, TSelectData> = {},
) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryCouponCodes(enterpriseCustomer.uuid),
      select: (data) => {
        if (select) {
          return select(data as TData);
        }
        return data;
      },
    }),
  );
}
