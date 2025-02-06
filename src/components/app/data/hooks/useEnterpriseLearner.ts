import { AppContext } from '@edx/frontend-platform/react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';

export type UseEnterpriseLearnerQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryFn' | 'queryKey'>;

export default function useEnterpriseLearner<TData = Types.EnterpriseLearnerData>(
  queryOptions: UseEnterpriseLearnerQueryOptions<Types.EnterpriseLearnerData, unknown, TData> = {},
) {
  const { authenticatedUser }: Types.AppContextValue = useContext(AppContext);
  const { enterpriseSlug } = useParams();

  return useQuery<Types.EnterpriseLearnerData, unknown, TData>({
    ...queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
    ...queryOptions,
  });
}
