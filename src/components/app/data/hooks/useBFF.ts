import { useLocation, useParams } from 'react-router-dom';
import {
  QueryFunction,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { resolveBFFQuery } from '../queries';
import { BaseBFFResponse } from '../services';

type BFFQueryOptions<TData, TSelect> = {
  select?: (data: TData) => TSelect;
};

type UseBFFArgs<
  TData extends BaseBFFResponse,
  TFallbackData = unknown,
  TBFFSelect extends TData = TData,
  TFallbackSelect = TFallbackData,
> = {
  bffQueryAdditionalParams?: Record<string, unknown>;
  bffQueryOptions?: BFFQueryOptions<TData, TBFFSelect>;
  fallbackQueryConfig: UseQueryOptions<TFallbackData, Error, TFallbackSelect>;
};

type UseQueryKeyArgs<TFallbackData = unknown, TFallbackSelect = TFallbackData> = {
  bffQueryAdditionalParams?: Record<string, any>;
  fallbackQueryConfig: UseQueryOptions<TFallbackData, Error, TFallbackSelect>;
};

type UseQueryFnArgs<TFallbackData = unknown, TFallbackSelect = TFallbackData> = {
  bffQueryAdditionalParams?: Record<string, any>;
  fallbackQueryConfig: UseQueryOptions<TFallbackData, Error, TFallbackSelect>;
};

type UseBFFSelectFnArgs<TData, TSelect> = {
  bffQueryOptions?: BFFQueryOptions<TData, TSelect>;
  fallbackQueryConfig: UseQueryOptions<TData, Error, TSelect>;
};

function useMatchedBFFQuery() {
  const location = useLocation();
  return resolveBFFQuery(location.pathname);
}

function useQueryKey<TFallbackData, TSelect>({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}: UseQueryKeyArgs<TFallbackData, TSelect>) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const params = useParams();
  const enterpriseSlug = params.enterpriseSlug!;

  if (matchedBFFQuery) {
    return matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams }).queryKey;
  }
  return fallbackQueryConfig.queryKey;
}

function useQueryFn<TFallbackData, TSelect>({
  bffQueryAdditionalParams,
  fallbackQueryConfig,
}: UseQueryFnArgs<TFallbackData, TSelect>) {
  const matchedBFFQuery = useMatchedBFFQuery();
  const params = useParams();
  const enterpriseSlug = params.enterpriseSlug!;

  if (matchedBFFQuery) {
    const queryConfig = matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams });
    return queryConfig.queryFn;
  }
  return fallbackQueryConfig.queryFn;
}

function useBFFSelectFn<TData, TSelect>({
  bffQueryOptions,
  fallbackQueryConfig,
}: UseBFFSelectFnArgs<TData, TSelect>) {
  const matchedBFFQuery = useMatchedBFFQuery();
  if (matchedBFFQuery && bffQueryOptions?.select) {
    return bffQueryOptions.select;
  }
  if (fallbackQueryConfig.select) {
    return fallbackQueryConfig.select;
  }
  return undefined;
}

/**
 * Uses the route to determine which API call to make for the BFF
 *
 * @param bffQueryAdditionalParams - additional fields to pass into a matched BFF query call
 * @param bffQueryOptions - the queryOptions specifically for the matched BFF query call
 * @param fallbackQueryConfig - if a route is not compatible with the BFF layer, this field
 * allows you to pass a fallback query endpoint to call in lieu of an unmatched BFF query
 */
export default function useBFF<
  TBFFData extends BaseBFFResponse,
  TFallbackData,
  TBFFSelect extends TBFFData = TBFFData,
  TFallbackSelect extends TFallbackData = TFallbackData,
>({
  bffQueryAdditionalParams = {},
  bffQueryOptions,
  fallbackQueryConfig,
}: UseBFFArgs<TBFFData, TFallbackData, TBFFSelect, TFallbackSelect>) {
  type TData = TBFFData | TFallbackData;
  type TSelect = TBFFSelect | TFallbackSelect;

  const queryKey = useQueryKey<TFallbackData, TFallbackSelect>({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  });
  const queryFn = useQueryFn<TFallbackData, TFallbackSelect>({
    bffQueryAdditionalParams,
    fallbackQueryConfig,
  }) as QueryFunction<TData, typeof queryKey>;

  const selectFn = useBFFSelectFn<TData, TSelect>({
    bffQueryOptions,
    fallbackQueryConfig,
  });

  return useQuery<TData, Error, TSelect>({
    queryKey,
    queryFn,
    select: selectFn,
  });
}
