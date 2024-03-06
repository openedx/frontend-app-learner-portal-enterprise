import { useQuery } from '@tanstack/react-query';
import { querySubscriptions } from '../app/routes/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { hasValidStartExpirationDates } from '../../utils/common';

export default function useSubscriptionPlan() {
  const { uuid } = useEnterpriseCustomer();
  const { data: subscriptionsData } = useQuery(querySubscriptions(uuid));
  const subscriptionPlan = subscriptionsData.subscriptionLicenses.map(subscriptionLicense => ({
    ...subscriptionLicense.subscriptionPlan,
    isCurrent: hasValidStartExpirationDates({
      startDate: subscriptionLicense.subscriptionPlan.startDate,
      expirationDate: subscriptionLicense.subscriptionPlan.expirationDate,
    }),
  }));
  return subscriptionPlan;
}
