import { useSuspenseQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterpriseOffers() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery({
    ...queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
  });
}
