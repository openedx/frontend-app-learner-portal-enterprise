import { useQuery } from '@tanstack/react-query';
import { queryAcademies, useEnterpriseCustomer } from '../app/data';

export default function useAcademies() {
  const { uuid } = useEnterpriseCustomer();
  const { data: academiesData, isLoading, isError } = useQuery(queryAcademies(uuid));

  return {
    academies: academiesData,
    isLoading,
    fetchError: isError,
  };
}
