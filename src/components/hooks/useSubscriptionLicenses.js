import { useQuery } from '@tanstack/react-query';
import { querySubscriptions } from '../app/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useSubscriptionLicenses() {
  const { uuid } = useEnterpriseCustomer();
  const { data: subscriptionsData } = useQuery(querySubscriptions(uuid));
  return {
    ...subscriptionsData,
  };
}
