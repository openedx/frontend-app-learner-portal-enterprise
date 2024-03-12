import { useQuery } from '@tanstack/react-query';
import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Custom hook to get subscriptions data for the enterprise.
 * @param {Types.UseQueryOptions} queryOptions
 * @returns {Types.UseQueryResults} The query results for the subscriptions.
 */
export default function useSubscriptions(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...querySubscriptions(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
