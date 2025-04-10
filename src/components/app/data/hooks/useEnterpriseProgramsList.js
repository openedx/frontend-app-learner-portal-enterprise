import { useSuspenseQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryEnterpriseProgramsList } from '../queries';

export default function useEnterpriseProgramsList(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery({
    ...queryEnterpriseProgramsList(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
