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
  return useBFF({
    bffQueryOptions: {
      select: (data) => transformSubscriptionsData(data?.enterpriseCustomerUserSubsidies?.subscriptions, true),
    },
    fallbackQueryConfig: {
      ...querySubscriptions(enterpriseCustomer.uuid),
      ...queryOptions,
    }
    ,
  });
}
