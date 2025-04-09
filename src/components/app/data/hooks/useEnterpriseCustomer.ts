import useEnterpriseLearner from './useEnterpriseLearner';

export interface UseEnterpriseCustomerSelectFnArgs {
  original: EnterpriseLearnerData;
  transformed: EnterpriseCustomer | null;
}

export interface UseEnterpriseCustomerOptions<TData> {
  select?: (data: UseEnterpriseCustomerSelectFnArgs) => TData;
}

/**
 * Helper hook to retrieve the enterprise customer metadata.
 */
export default function useEnterpriseCustomer<TData = EnterpriseCustomer | null>(
  options: UseEnterpriseCustomerOptions<TData> = {},
) {
  const { select } = options;
  return useEnterpriseLearner<TData>({
    select: (enterpriseLearner) => {
      const { enterpriseCustomer } = enterpriseLearner.original;
      if (select) {
        return select({
          original: enterpriseLearner.original,
          transformed: enterpriseCustomer,
        });
      }
      return enterpriseCustomer as TData;
    },
  });
}
