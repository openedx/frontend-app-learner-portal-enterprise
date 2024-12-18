import useEnterpriseLearner from './useEnterpriseLearner';

export default function useEnterpriseFeatures(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (data) => {
      if (select) {
        return select({
          original: data,
          transformed: data?.enterpriseFeatures,
        });
      }
      return data?.enterpriseFeatures;
    },
  });
}
