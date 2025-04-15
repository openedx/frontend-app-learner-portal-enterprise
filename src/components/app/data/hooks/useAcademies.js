import { useSuspenseQuery } from '@tanstack/react-query';

import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryAcademiesList } from '../queries';

export default function useAcademies() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery({
    ...queryAcademiesList(enterpriseCustomer.uuid),
  });
}
