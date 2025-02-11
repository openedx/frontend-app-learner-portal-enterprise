import useEnterpriseLearner from './useEnterpriseLearner';

export default function useEnterpriseFeatures(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (data) => {
      console.log(data, 'features');
      const transformedData = data.enterpriseFeatures || data.transformed.enterpriseFeatures;
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
