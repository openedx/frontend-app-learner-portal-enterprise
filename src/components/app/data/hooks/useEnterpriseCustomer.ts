import useEnterpriseLearner from './useEnterpriseLearner';

type UseEnterpriseCustomerSelectFnArgs = {
  original: EnterpriseLearnerData | BFFResponse;
  transformed: EnterpriseLearnerData['enterpriseCustomer'];
};

type UseEnterpriseCustomerQueryOptions = {
  select?: (data: UseEnterpriseCustomerSelectFnArgs) => unknown;
};

/**
 * Helper hook to retrieve the enterprise customer metadata.
 */
export default function useEnterpriseCustomer<TData = EnterpriseCustomer | null>(
  queryOptions: UseEnterpriseCustomerQueryOptions = {},
) {
  const { select } = queryOptions;
  return useEnterpriseLearner<TData>({
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
