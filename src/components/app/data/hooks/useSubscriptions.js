import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { useSuspenseBFF } from './useBFF';

/**
 * Custom hook to get subscriptions data for the enterprise.
 * @param {object} [queryOptions]
 * @returns The query results for the subscriptions.
 */
export default function useSubscriptions(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;

  return useSuspenseBFF({
    bffQueryOptions: {
      ...queryOptionsRest,
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
      ...queryOptions,
    },
  });
}
