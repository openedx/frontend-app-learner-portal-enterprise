import useEnterpriseLearner from './useEnterpriseLearner';

export interface UseEnterpriseCustomerSelectFnArgs {
  original: Types.EnterpriseLearnerData;
  transformed: Types.EnterpriseCustomer | null;
}

export interface UseEnterpriseCustomerOptions<TData> {
  select?: (args: UseEnterpriseCustomerSelectFnArgs) => TData;
}

/**
 * Helper hook to retrieve the enterprise customer metadata.
 */
export default function useEnterpriseCustomer<
  TData = Types.EnterpriseCustomer | null,
>(options: UseEnterpriseCustomerOptions<TData> = {}) {
  const { select } = options;
  return useEnterpriseLearner<TData>({
    select: (enterpriseLearner) => {
      if (select) {
        return select({
          original: enterpriseLearner,
          transformed: enterpriseLearner.enterpriseCustomer,
        });
      }
      return enterpriseLearner.enterpriseCustomer as TData;
    },
  });
}
