import useEnterpriseLearner from './useEnterpriseLearner';

export type UseEnterpriseFeaturesSelectFnArgs = {
  original: EnterpriseLearnerData;
  transformed: EnterpriseFeatures;
};

export type UseEnterpriseFeaturesOptions<TData> = {
  select?: (args: UseEnterpriseFeaturesSelectFnArgs) => TData;
};

export default function useEnterpriseFeatures<
  TData = EnterpriseFeatures,
>(options: UseEnterpriseFeaturesOptions<TData> = {}) {
  const { select } = options;
  return useEnterpriseLearner<TData>({
    select: (data) => {
      const transformedData = data.enterpriseFeatures;
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData as TData;
    },
  });
}
