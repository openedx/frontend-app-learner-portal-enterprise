import { useQuery } from '@tanstack/react-query';
import { queryAcademiesList, useEnterpriseCustomer } from '../app/data';

export default function useAcademies() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery(queryAcademiesList(enterpriseCustomer.uuid));
}
