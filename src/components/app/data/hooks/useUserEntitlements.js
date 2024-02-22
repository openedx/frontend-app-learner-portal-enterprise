import { useQuery } from '@tanstack/react-query';
import { makeUserEntitlementsQuery } from '../../routes/queries';

/**
 * Retrieves the user entitlements.
 * @returns {Types.UseQueryResult}} The query results for the user entitlements.
 */
export default function useUserEntitlements() {
  return useQuery(makeUserEntitlementsQuery());
}
