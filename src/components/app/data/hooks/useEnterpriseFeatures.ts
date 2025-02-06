import { UseQueryOptions } from '@tanstack/react-query';
import useEnterpriseLearner from './useEnterpriseLearner';

interface UseEnterpriseFeaturesSelectArgs {
  original: Types.EnterpriseLearnerData;
  transformed: Types.EnterpriseFeatures;
}

export type UseEnterpriseFeaturesQueryOptions = Omit<UseQueryOptions<Types.EnterpriseLearnerData, unknown, Types.EnterpriseFeatures>, 'queryFn' | 'queryKey' | 'select'> & {
  select?: (args: UseEnterpriseFeaturesSelectArgs) => Types.EnterpriseFeatures;
};

export default function useEnterpriseFeatures(
  queryOptions: UseEnterpriseFeaturesQueryOptions = {},
) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (data) => {
      const transformedData = data.enterpriseFeatures;
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
  });
}
