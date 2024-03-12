import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryEnterpriseProgramsList } from '../queries';

export default function useEnterpriseProgramsList(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseProgramsList(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
