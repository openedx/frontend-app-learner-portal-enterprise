import { useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { LICENSE_STATUS } from './constants';
import { fetchSubscriptionLicensesForUser } from './service';
import {
  hasValidStartExpirationDates,
  isDefinedAndNotNull,
  isDefinedAndNull,
} from '../../../utils/common';

export function useSubscriptionLicenseForUser(subscriptionPlan) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDefinedAndNull(subscriptionPlan)) {
      setIsLoading(false);
      return;
    }

    if (isDefinedAndNotNull(subscriptionPlan)) {
      if (!hasValidStartExpirationDates(subscriptionPlan)) {
        setIsLoading(false);
        return;
      }

      fetchSubscriptionLicensesForUser(subscriptionPlan.uuid)
        .then((response) => {
          const { results } = camelCaseObject(response.data);
          const activated = results.filter(result => result.status === LICENSE_STATUS.ACTIVATED);
          const assigned = results.filter(result => result.status === LICENSE_STATUS.ASSIGNED);
          const revoked = results.filter(result => result.status === LICENSE_STATUS.REVOKED);

          if (activated.length) {
            setLicense(activated.pop());
          } else if (assigned.length) {
            setLicense(assigned.pop());
          } else if (revoked.length) {
            setLicense(revoked.pop());
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
