import useEnterpriseLearner from './useEnterpriseLearner';

export default function useEnterpriseFeatures(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (data) => data.enterpriseFeatures,
  });
}
