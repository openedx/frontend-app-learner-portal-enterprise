import { useQuery } from '@tanstack/react-query';
import { querySubscriptions } from '../app/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { hasValidStartExpirationDates } from '../../utils/common';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';

export default function useSubscriptionLicenses() {
  const { uuid } = useEnterpriseCustomer();
  const { data: subscriptionsData } = useQuery(querySubscriptions(uuid));

  return {
    ...subscriptionsData,
  };
}
