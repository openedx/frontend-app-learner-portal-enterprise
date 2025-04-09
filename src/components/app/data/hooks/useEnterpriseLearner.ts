import { AppContext } from '@edx/frontend-platform/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';
import useBFF from './useBFF';
import { BaseBFFResponse } from '../services';

export interface UseEnterpriseLearnerSelectFnArgs {
  original: EnterpriseLearnerData;
  transformed: EnterpriseLearnerData;
}

export interface UseEnterpriseLearnerOptions<TData> {
  select?: (data: UseEnterpriseLearnerSelectFnArgs) => TData;
}

/**
 * Retrieves the enterprise learner data for the authenticated user.
 */
export default function useEnterpriseLearner<TData = EnterpriseLearnerData>(
  options: UseEnterpriseLearnerOptions<TData> = {},
) {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { enterpriseSlug } = useParams();

  const { select } = options;
  const fallbackQueryConfig = queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug);

  return useBFF<BaseBFFResponse, EnterpriseLearnerData, TData>({
    bffQueryOptions: {
      select: (data) => {
        const transformedData = {
          enterpriseCustomer: data.enterpriseCustomer,
          activeEnterpriseCustomer: data.activeEnterpriseCustomer,
          shouldUpdateActiveEnterpriseCustomerUser: data.shouldUpdateActiveEnterpriseCustomerUser,
          allLinkedEnterpriseCustomerUsers: data.allLinkedEnterpriseCustomerUsers,
          staffEnterpriseCustomer: data.staffEnterpriseCustomer,
          enterpriseFeatures: data.enterpriseFeatures,
        } as EnterpriseLearnerData;
        // When custom `select` function is provided in `queryOptions`, call it with original and transformed data.
        if (select) {
          return select({
            original: data,
            transformed: transformedData,
          });
        }

        // Otherwise, return the transformed data.
        return transformedData as TData;
      },
    },
    fallbackQueryConfig: {
      ...fallbackQueryConfig,
      select: (data) => {
        // To maintain parity with BFF-enabled routes in the function signature passed to the custom `select`
        // function, the legacy `queryEnterpriseLearner` also passes its `data` to the custom `select` function
        // as both the `original` and `transformed` properties, since no data transformations occur here.
        if (select) {
          return select({
            original: data,
            transformed: data,
          });
        }
        return data as TData;
      },
    },
  });
}
