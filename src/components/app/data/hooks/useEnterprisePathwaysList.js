import { useQuery } from '@tanstack/react-query';

import { queryEnterprisePathwaysList } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterprisePathwaysList(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterprisePathwaysList(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
