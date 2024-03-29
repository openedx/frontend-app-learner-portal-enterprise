import { useQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterpriseOffers(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}
