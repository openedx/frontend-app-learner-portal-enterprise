import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { queryEnterpriseCustomerContainsContent } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given content identifier is contained within the enterprise customer's catalogs.
 * @returns The query result.
 */
export function useEnterpriseCustomerContainsContent(contentIdentifiers: string[]) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useQuery(
    queryOptions({
      ...queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, contentIdentifiers),
    }),
  );
}

export function useEnterpriseCustomerContainsContentSuspense(contentIdentifiers: string[]) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, contentIdentifiers),
    }),
  );
}
