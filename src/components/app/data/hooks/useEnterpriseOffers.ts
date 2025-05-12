import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterpriseOffers() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      ...queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
    }),
  );
}
