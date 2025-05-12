import useEnterpriseLearner from './useEnterpriseLearner';

type UseEnterpriseFeaturesSelectFnArgs = {
  original: EnterpriseLearnerData | BFFResponse;
  transformed: EnterpriseFeatures;
};

type UseEnterpriseFeaturesQueryOptions = {
  select?: (data: UseEnterpriseFeaturesSelectFnArgs) => unknown;
};

export default function useEnterpriseFeatures(
  options: UseEnterpriseFeaturesQueryOptions = {},
) {
  const { select } = options;
  return useEnterpriseLearner({
    select: (data) => {
      const transformedData = data.transformed.enterpriseFeatures;
      if (select) {
        return select({
          original: data.original,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
  });
}
