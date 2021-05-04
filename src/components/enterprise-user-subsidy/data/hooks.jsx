import {
  useState, useEffect, useReducer,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchOffers } from '../offers';
import offersReducer, { initialOfferState } from '../offers/data/reducer';

import { LICENSE_STATUS } from './constants';
import {
  fetchSubscriptionLicensesForUser,
} from './service';
import { features } from '../../../config';

export function useSubscriptionLicenseForUser(enterpriseId) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionLicensesForUser(enterpriseId)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        const activated = results.filter(result => result.status === LICENSE_STATUS.ACTIVATED);
        const assigned = results.filter(result => result.status === LICENSE_STATUS.ASSIGNED);
        const revoked = results.filter(result => result.status === LICENSE_STATUS.REVOKED);

        if (activated.length) {
          setLicense(activated.shift());
        } else if (assigned.length) {
          setLicense(assigned.shift());
        } else if (revoked.length) {
          setLicense(revoked.shift());
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
  }, [enterpriseId]);

  return [license, isLoading];
}

export function useOffers(enterpriseId) {
  const [offerState, dispatch] = useReducer(offersReducer, initialOfferState);

  useEffect(
    () => {
      if (features.ENROLL_WITH_CODES) {
        fetchOffers({
          enterprise_uuid: enterpriseId,
          full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
          is_active: 'True',
        },
        dispatch);
      }
    },
    [enterpriseId],
  );

  return [offerState, offerState.loading];
}
