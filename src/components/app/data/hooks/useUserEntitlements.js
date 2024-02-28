import { useQuery } from '@tanstack/react-query';
import { makeUserEntitlementsQuery } from '../../routes/data/services';

/**
 * Retrieves the user entitlements.
 * @returns {Types.UseQueryResult}} The query results for the user entitlements.
 */
export default function useUserEntitlements() {
  return useQuery(makeUserEntitlementsQuery());
}
