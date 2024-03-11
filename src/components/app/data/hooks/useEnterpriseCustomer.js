import useEnterpriseLearner from './useEnterpriseLearner';

/**
 *
 * @param {Types.UseQueryOptions} queryOptions
 * @returns {Types.UseQueryResult}
 */
export default function useEnterpriseCustomer(queryOptions = {}) {
  return useEnterpriseLearner({
    select: (data) => data.enterpriseCustomer,
    ...queryOptions,
  });
}
