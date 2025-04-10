import useEnterpriseLearner from './useEnterpriseLearner';

/**
 * Helper hook to retrieve the enterprise customer metadata.
 * @param {object} queryOptions
 * @returns The query results.
 */
export default function useEnterpriseCustomer(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (data) => {
      const transformedData = data.transformed.enterpriseCustomer;
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
