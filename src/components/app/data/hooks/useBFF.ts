import { useLocation, useParams } from 'react-router-dom';
import { QueryFunction, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { resolveBFFQuery } from '../queries';

type BffQueryOptions = {
  select?: (data: any) => unknown;
};

type UseBFFArgs = {
  bffQueryAdditionalParams?: Record<string, any>;
  bffQueryOptions?: BffQueryOptions;
  fallbackQueryConfig: UseQueryOptions;
};

type UseSuspenseBFFArgs = UseBFFArgs;

type UseQueryKeyArgs = {
  bffQueryAdditionalParams?: Record<string, any>;
  fallbackQueryConfig: UseQueryOptions;
};

function useMatchedBFFQuery() {
  const location = useLocation();
  return resolveBFFQuery(location.pathname);
}

function useQueryKey({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}: UseQueryKeyArgs) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const params = useParams();
  const enterpriseSlug = params.enterpriseSlug!;

  if (matchedBFFQuery) {
    return matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams }).queryKey;
  }
  return fallbackQueryConfig.queryKey;
}

function useQueryFn({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}: UseQueryKeyArgs) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const params = useParams();
  const enterpriseSlug = params.enterpriseSlug!;

  if (matchedBFFQuery) {
    const queryConfig = matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams });
    return queryConfig.queryFn;
  }
  return fallbackQueryConfig.queryFn as QueryFunction;
}

function useBaseQueryConfig({
  bffQueryAdditionalParams = {},
  fallbackQueryConfig,
}: UseBFFArgs) {
  const queryKey = useQueryKey({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  });
  const queryFn = useQueryFn({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  });
  return {
    queryKey,
    queryFn,
  };
}

/**
 * Uses the route to determine which API call to make for the BFF
 *
 * @param bffQueryAdditionalParams - additional fields to pass into a matched BFF query call
 * @param bffQueryOptions - the queryOptions specifically for the matched BFF query call
 * @param fallbackQueryConfig - if a route is not compatible with the BFF layer, this field
 * allows you to pass a fallback query endpoint to call in lieu of an unmatched BFF query
 */
export default function useBFF({
  bffQueryAdditionalParams = {},
  bffQueryOptions = {},
  fallbackQueryConfig,
}: UseBFFArgs) {
  const baseQueryConfig = useBaseQueryConfig({
    bffQueryAdditionalParams,
    bffQueryOptions,
    fallbackQueryConfig,
  });

  return useQuery({
    ...baseQueryConfig,
  });
}

export function useSuspenseBFF({
  bffQueryAdditionalParams = {},
  bffQueryOptions = {},
  fallbackQueryConfig,
}: UseSuspenseBFFArgs) {
  const baseQueryConfig = useBaseQueryConfig({
    bffQueryAdditionalParams,
    bffQueryOptions,
    fallbackQueryConfig,
  });
  return useSuspenseQuery({
    ...baseQueryConfig,
  });
}
