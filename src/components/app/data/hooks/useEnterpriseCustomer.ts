import { UseQueryOptions } from '@tanstack/react-query';
import useEnterpriseLearner from './useEnterpriseLearner';

interface UseEnterpriseCustomerSelectArgs {
  original: Types.EnterpriseLearnerData;
  transformed: Types.EnterpriseCustomer | null;
}

export type UseEnterpriseCustomerQueryOptions = Omit<UseQueryOptions<Types.EnterpriseLearnerData, unknown, Types.EnterpriseCustomer | null>, 'select'> & {
  select?: (args: UseEnterpriseCustomerSelectArgs) => Types.EnterpriseCustomer | null;
};

/**
 * Helper hook to retrieve the enterprise customer metadata.
 */
export default function useEnterpriseCustomer(
  queryOptions: UseEnterpriseCustomerQueryOptions = {},
) {
  const { select, ...queryOptionsRest } = queryOptions;
  return useEnterpriseLearner({
    ...queryOptionsRest,
    select: (enterpriseLearner) => {
      const transformedData = enterpriseLearner.enterpriseCustomer;
      if (select) {
        const selectArgs = {
          original: enterpriseLearner,
          transformed: transformedData,
        };
        return select(selectArgs);
      }
      return transformedData;
    },
  });
}
