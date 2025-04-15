import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { resolveBFFQuery } from '../queries';

/**
 * Resolves a matched BFF query for the current route, or null if no match is found.
 */
function useMatchedBFFQuery() {
  const location = useLocation();
  return resolveBFFQuery(location.pathname);
}

/**
 * Retrieves the query key for the BFF query or the fallback query.
 */
function useQueryKey({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const { enterpriseSlug } = useParams();

  if (matchedBFFQuery) {
    return matchedBFFQuery({
      enterpriseSlug,
      ...bffQueryAdditionalParams,
    }).queryKey;
  }
  return fallbackQueryConfig.queryKey;
}

/**
 * Retrieves the query function for the BFF query or the fallback query.
 */
function useQueryFn({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const { enterpriseSlug } = useParams();

  if (matchedBFFQuery) {
    const bffQueryConfig = matchedBFFQuery({
      enterpriseSlug,
      ...bffQueryAdditionalParams,
    });
    return bffQueryConfig.queryFn;
  }
  return fallbackQueryConfig.queryFn;
}

/**
 * Retrieves the select transform function for the BFF query or the fallback query.
 */
function useBFFSelectFn({
  bffQueryOptions,
  fallbackQueryConfig,
}) {
  const matchedBFFQuery = useMatchedBFFQuery();
  if (matchedBFFQuery && bffQueryOptions.select) {
    return bffQueryOptions.select;
  }
  if (fallbackQueryConfig.select) {
    return fallbackQueryConfig.select;
  }
  return undefined;
}

/**
 * Helper hook to retrieve the BFF query configuration.
 */
function useBFFQueryConfig({
  bffQueryAdditionalParams = {},
  bffQueryOptions,
  fallbackQueryConfig,
}) {
  const queryKey = useQueryKey({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  });
  const queryFn = useQueryFn({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  });
  const selectFn = useBFFSelectFn({
    bffQueryOptions,
    fallbackQueryConfig,
  });
  return {
    queryKey,
    queryFn,
    select: selectFn,
  };
}

/**
 * Determines whether the current page route is BFF-enabled; if so, this hook will rely on the
 * resolved BFF query for the current route. If the current route is not BFF-enabled, this hook
 * will rely on the fallback query.
 *
 * @param bffQueryAdditionalParams - additional fields to pass into a matched BFF query call
 * @param bffQueryOptions - the queryOptions specifically for the matched BFF query call
 * @param fallbackQueryConfig - if a route is not compatible with the BFF layer, this field
 * allows you to pass a fallback query endpoint to call in lieu of an unmatched BFF query
 * @returns The query results.
 */
export default function useBFF({
  bffQueryAdditionalParams = {},
  bffQueryOptions,
  fallbackQueryConfig,
}) {
  const queryConfig = useBFFQueryConfig({
    bffQueryAdditionalParams,
    bffQueryOptions,
    fallbackQueryConfig,
  });
  return useQuery({ ...queryConfig });
}

/**
 * Determines whether the current page route is BFF-enabled; if so, this hook will rely on the
 * resolved BFF query for the current route. If the current route is not BFF-enabled, this hook
 * will rely on the fallback query.
 *
 * Similar to useBFF, but returns a Suspense-enabled query.
 *
 * @param bffQueryAdditionalParams - additional fields to pass into a matched BFF query call
 * @param bffQueryOptions - the queryOptions specifically for the matched BFF query call
 * @param fallbackQueryConfig - if a route is not compatible with the BFF layer, this field
 * allows you to pass a fallback query endpoint to call in lieu of an unmatched BFF query
 * @returns The query results.
 */
export function useSuspenseBFF<TData = unknown>({
  bffQueryAdditionalParams = {},
  bffQueryOptions,
  fallbackQueryConfig,
}) {
  const queryConfig = useBFFQueryConfig({
    bffQueryAdditionalParams,
    bffQueryOptions,
    fallbackQueryConfig,
  });
  return useSuspenseQuery<TData>({
    ...queryConfig,
  });
}
