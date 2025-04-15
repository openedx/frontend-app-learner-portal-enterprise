import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryAcademiesList } from '../queries';

export default function useAcademies() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery(
    queryOptions({
      ...queryAcademiesList(enterpriseCustomer.uuid),
    }),
  );
}
