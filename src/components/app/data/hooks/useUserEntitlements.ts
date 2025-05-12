import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryUserEntitlements } from '../queries';

/**
 * Retrieves the user entitlements.
 * @returns The query results for the user entitlements.
 */
export default function useUserEntitlements() {
  return useSuspenseQuery(
    queryOptions({
      ...queryUserEntitlements(),
    }),
  );
}
