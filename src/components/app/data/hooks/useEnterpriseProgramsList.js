import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryEnterpriseProgramsList } from '../queries';

export default function useEnterpriseProgramsList() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery(
    queryOptions({
      ...queryEnterpriseProgramsList(enterpriseCustomer.uuid),
    }),
  );
}
