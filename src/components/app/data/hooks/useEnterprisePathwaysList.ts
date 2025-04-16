import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryEnterprisePathwaysList } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterprisePathwaysList() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryEnterprisePathwaysList(enterpriseCustomer.uuid),
    }),
  );
}
