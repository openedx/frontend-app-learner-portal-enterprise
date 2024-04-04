import useEnterpriseLearner from './useEnterpriseLearner';

/**
 * Helper hook to retrieve the enterprise customer metadata.
 * @param {Types.UseQueryOptions} queryOptions
 * @returns {Types.UseQueryResult}
 */
export default function useEnterpriseCustomer(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (enterpriseLearner) => {
      if (select) {
        return select({
          original: enterpriseLearner,
          transformed: enterpriseLearner.enterpriseCustomer,
        });
      }
      return enterpriseLearner.enterpriseCustomer;
    },
  });
}
