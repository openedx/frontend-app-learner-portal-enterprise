import { useQuery } from '@tanstack/react-query';
import { queryUserEntitlements } from '../../routes/data/queries';

/**
 * Retrieves the user entitlements.
 * @returns {Types.UseQueryResult}} The query results for the user entitlements.
 */
export default function useUserEntitlements() {
  return useQuery(queryUserEntitlements());
}
