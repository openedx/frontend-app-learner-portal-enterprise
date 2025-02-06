import { UseQueryOptions } from '@tanstack/react-query';
import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useBFF from './useBFF';

export type UseSubscriptionsQueryOptions = Omit<UseQueryOptions, 'queryKey' | 'queryFn'>;

/**
 * Custom hook to get subscriptions data for the enterprise.
 */
export default function useSubscriptions(queryOptions: UseSubscriptionsQueryOptions = {}) {
  const enterpriseCustomerQueryResult = useEnterpriseCustomer();
  const enterpriseCustomer = enterpriseCustomerQueryResult.data!;
  const { select, ...queryOptionsRest } = queryOptions;

  return useBFF({
    bffQueryOptions: {
      ...queryOptionsRest,
      select: (data: Types.BaseBFFResponse) => {
        const transformedData = data.enterpriseCustomerUserSubsidies?.subscriptions;

        // When custom `select` function is provided in `queryOptions`, call it with original and transformed data.
        if (select) {
          return select({
            original: data,
            transformed: transformedData,
          });
        }

        // Otherwise, return the transformed data.
        return transformedData;
      },
    },
    fallbackQueryConfig: {
      ...querySubscriptions(enterpriseCustomer.uuid),
      ...queryOptions,
    },
  });
}
