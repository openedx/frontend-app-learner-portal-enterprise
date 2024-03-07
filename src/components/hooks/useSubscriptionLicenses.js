import { useQuery } from '@tanstack/react-query';
import { querySubscriptions } from '../app/routes/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { hasValidStartExpirationDates } from '../../utils/common';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';

export default function useSubscriptionLicenses() {
  const { uuid } = useEnterpriseCustomer();
  const { data: subscriptionsData } = useQuery(querySubscriptions(uuid));

  const currentSubscriptionLicensesData = subscriptionsData.subscriptionLicenses.map(subscriptionLicense => (
    {
      ...subscriptionLicense,
      subscriptionPlan: {
        ...subscriptionLicense.subscriptionPlan,
        isCurrent: hasValidStartExpirationDates({
          startDate: subscriptionLicense.subscriptionPlan.startDate,
          expirationDate: subscriptionLicense.subscriptionPlan.expirationDate,
        }),
      },
    }
  ));

  const licensesByStatus = {
    [LICENSE_STATUS.ACTIVATED]: [],
    [LICENSE_STATUS.ASSIGNED]: [],
    [LICENSE_STATUS.REVOKED]: [],
  };
  currentSubscriptionLicensesData.forEach(license => {
    licensesByStatus[license.status].push(license);
  });
  const applicableLicense = Object.values(licensesByStatus).flat()[0];

  return {
    applicableLicense,
    licensesByStatus,
    subscriptionLicenses: currentSubscriptionLicensesData
  };
}
