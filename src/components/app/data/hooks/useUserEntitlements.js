import { useQuery } from '@tanstack/react-query';
import { queryUserEntitlements } from '../queries';

/**
 * Retrieves the user entitlements.
 * @returns {Types.UseQueryResult}} The query results for the user entitlements.
 */
export default function useUserEntitlements(queryOptions = {}) {
  return useQuery({
    ...queryUserEntitlements(),
    ...queryOptions,
  });
}
