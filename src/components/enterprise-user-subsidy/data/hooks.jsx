import {
  useState, useEffect, useReducer,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchOffers } from '../offers';
import offersReducer, { initialOfferState } from '../offers/data/reducer';

import { LICENSE_STATUS } from './constants';
import { fetchSubscriptionLicensesForUser } from './service';
import {
  hasValidStartExpirationDates,
  isDefinedAndNotNull,
  isDefinedAndNull,
} from '../../../utils/common';
import { features } from '../../../config';

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

export function useOffers(enterpriseId) {
  const [offerState, dispatch] = useReducer(offersReducer, initialOfferState);

  useEffect(
    () => {
      if (features.ENROLL_WITH_CODES) {
        fetchOffers('full_discount_only=True', dispatch);
      }
    },
    [enterpriseId],
  );

  return [offerState, offerState.loading];
}
