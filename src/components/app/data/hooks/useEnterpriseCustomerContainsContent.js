import { useQuery } from '@tanstack/react-query';

import { queryEnterpriseCustomerContainsContent } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Determines whether the given content identifier is contained within the enterprise customer's catalogs.
 * @returns {Types.UseQueryResult}
 */
export default function useEnterpriseCustomerContainsContent(contentIdentifers, queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, contentIdentifers),
    ...queryOptions,
  });
}
