import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryEnterpriseLearnerOffers } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useEnterpriseOffers() {
  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  return useSuspenseQuery(
    queryOptions({
      queryKey: queryEnterpriseLearnerOffers(enterpriseCustomer.uuid).queryKey,
      queryFn: () => (
        {
          enterpriseOffers: [],
          currentEnterpriseOffers: [],
          // Note: We are hard coding to false since offers are now deprecated as of 09/15/2025, HU
          canEnrollWithEnterpriseOffers: false,
          hasCurrentEnterpriseOffers: false,
          hasLowEnterpriseOffersBalance: false,
          hasNoEnterpriseOffersBalance: true,
        }
      ),
      retry: false,
    }),
  );
}
