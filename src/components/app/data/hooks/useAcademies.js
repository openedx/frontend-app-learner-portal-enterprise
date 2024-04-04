import { useQuery } from '@tanstack/react-query';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryAcademiesList } from '../queries';

export default function useAcademies(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryAcademiesList(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
