import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useBFF from './useBFF';
import { transformSubscriptionsData } from '../services';

/**
 * Custom hook to get subscriptions data for the enterprise.
 * @param {Types.UseQueryOptions} queryOptions
 * @returns {Types.UseQueryResults} The query results for the subscriptions.
 */
export default function useSubscriptions(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, ...queryOptionsRest } = queryOptions;

  return useBFF({
    bffQueryOptions: {
      ...queryOptionsRest,
      select: (data) => {
        const transformedData = transformSubscriptionsData(
          data?.enterpriseCustomerUserSubsidies?.subscriptions,
          { isBFFData: true },
        );

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
