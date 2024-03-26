import { useQuery } from '@tanstack/react-query';

import { queryEnterpriseCustomerContainsContent } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * TODO
 * @returns
 */
export default function useEnterpriseCustomerContainsContent(contentIdentifer, queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, contentIdentifer),
    ...queryOptions,
  });
}
