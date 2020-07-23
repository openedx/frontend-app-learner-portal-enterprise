import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { isNull, hasValidStartExpirationDates } from '../../../utils/common';
import { LICENSE_STATUS } from './constants';
import { fetchSubscriptionLicensesForUser } from './service';

export function useSubscriptionLicenseForUser(subscriptionPlan) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!subscriptionPlan || isNull(subscriptionPlan) || !hasValidStartExpirationDates(subscriptionPlan)) {
      setIsLoading(false);
      return;
    }

    if (subscriptionPlan?.uuid) {
      fetchSubscriptionLicensesForUser(subscriptionPlan.uuid)
        .then((response) => {
          const { results } = camelCaseObject(response.data);
          const activated = results.filter(result => result.status === LICENSE_STATUS.ACTIVATED);
          const assigned = results.filter(result => result.status === LICENSE_STATUS.ASSIGNED);
          const deactivated = results.filter(result => result.status === LICENSE_STATUS.DEACTIVATED);

          if (activated.length) {
            setLicense(activated.pop());
          } else if (assigned.length) {
            setLicense(assigned.pop());
          } else if (deactivated.length) {
            setLicense(deactivated.pop());
          } else {
            setLicense(null);
          }
        })
        .catch((error) => {
          logError(new Error(error));
          setLicense(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [subscriptionPlan]);

  return [license, isLoading];
}
