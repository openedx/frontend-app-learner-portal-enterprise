import { useQuery } from '@tanstack/react-query';
import { queryAcademiesList, useEnterpriseCustomer } from '../app/data';

export default function useAcademies() {
  const { data: { uuid } } = useEnterpriseCustomer();
  const { data: academiesData, isLoading, isError } = useQuery(queryAcademiesList(uuid));

  return {
    academies: academiesData,
    isLoading,
    fetchError: isError,
  };
}
