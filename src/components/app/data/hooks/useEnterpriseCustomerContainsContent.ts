import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryEnterpriseCustomerContainsContent } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given content identifier is contained within the enterprise customer's catalogs.
 * @returns The query result.
 */
export default function useEnterpriseCustomerContainsContent(contentIdentifiers: string[]) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, contentIdentifiers),
    }),
  );
}
