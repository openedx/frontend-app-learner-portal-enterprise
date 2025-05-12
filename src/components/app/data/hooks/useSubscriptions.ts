import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { useSuspenseBFF } from './useBFF';

type UseSubscriptionsQueryOptionsSelectFnArgs = {
  original: unknown;
  transformed: unknown;
};

type UseSubscriptionsQueryOptions = {
  enabled?: boolean;
  select?: (data: UseSubscriptionsQueryOptionsSelectFnArgs) => unknown;
};

/**
 * Custom hook to get subscriptions data for the enterprise.
 * @returns The query results for the subscriptions.
 */
export default function useSubscriptions(queryOptions: UseSubscriptionsQueryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { select } = queryOptions;

  return useSuspenseBFF({
    bffQueryOptions: {
      select: (data) => {
        const transformedData = data?.enterpriseCustomerUserSubsidies?.subscriptions;

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
      select,
    },
  });
}
