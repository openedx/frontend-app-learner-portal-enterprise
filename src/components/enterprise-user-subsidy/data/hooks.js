import {
  useState, useEffect, useReducer,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { fetchOffers } from '../offers';
import offersReducer, { initialOfferState } from '../offers/data/reducer';

import { LICENSE_STATUS } from './constants';
import {
  fetchSubscriptionLicensesForUser,
  fetchCustomerAgreementData,
  fetchEnterpriseCatalogData,
  requestAutoAppliedLicense,
} from './service';
import { features } from '../../../config';

/**
 * Attempts to fetch any existing licenses associated with the authenticated user and the
 * specified enterprise customer. Priority is given to activated licenses, then assigned
 * licenses, then revoked licenses.
 *
 * @param {string} enterpriseId The UUID of the enterprise customer
 * @returns An object representing a user's subscription license or null if no license was found.
 */
const fetchExistingUserLicense = async (enterpriseId) => {
  try {
    const response = await fetchSubscriptionLicensesForUser(enterpriseId);
    const { results } = camelCaseObject(response.data);
    /**
     * Ordering of these status keys (i.e., activated, assigned, revoked) is important as the first
     * license found when iterating through each status key in this order will be selected as the
     * applicable license for use by the rest of the application.
     *
     * Example: an activated license will be chosen as the applicable license because activated licenses
     * come first in ``licensesByStatus`` even if the user also has a revoked license.
     */
    const licensesByStatus = {
      [LICENSE_STATUS.ACTIVATED]: [],
      [LICENSE_STATUS.ASSIGNED]: [],
      [LICENSE_STATUS.REVOKED]: [],
    };
    results.forEach((item) => {
      licensesByStatus[item.status].push(item);
    });
    const applicableLicense = Object.values(licensesByStatus).flat()[0];
    return applicableLicense;
  } catch {
    return null;
  }
};

/**
 * Attempts to auto-apply a license for the authenticated user and the specified customer agreement.
 *
 * @param {string} customerAgreementId The UUID of the customer agreement.
 * @returns An object representing the auto-applied license or null if no license was auto-applied.
 */
const requestAutoAppliedUserLicense = async (customerAgreementId) => {
  try {
    const response = await requestAutoAppliedLicense(customerAgreementId);
    const license = camelCaseObject(response.data);
    return license;
  } catch {
    return null;
  }
};

/**
 * Retrieves a license for the authenticated user, if applicable. First attempts to find any existing licenses
 * for the user. If a license is found, the app uses it; otherwise, if the enterprise has an SSO/LMS identity
 * provider configured and the customer agreement has a subscription plan suitable for auto-applied licenses,
 * attempt to auto-apply a license for the user.
 *
 * @param {object} args
 * @param {object} args.enterpriseConfig The enterprise customer config
 * @param {object} args.customerAgreementConfig The customer agreement config associated with the enterprise
 * @param {boolean} args.isLoadingCustomerAgreementConfig Whether the customer agreement is still resolving
 * @returns Array containing a user license, if applicable, and whether the license data is still resolving
 */
export function useSubscriptionLicense({
  enterpriseConfig,
  customerAgreementConfig,
  isLoadingCustomerAgreementConfig,
}) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const {
    uuid: enterpriseId,
    identityProvider: enterpriseIdentityProvider,
  } = enterpriseConfig;

  useEffect(() => {
    async function retrieveUserLicense() {
      let result = await fetchExistingUserLicense(enterpriseId);

      if (features.ENABLE_AUTO_APPLIED_LICENSES) {
        const customerAgreementMetadata = [
          customerAgreementConfig?.uuid,
          customerAgreementConfig?.subscriptionForAutoAppliedLicenses,
        ];
        const hasCustomerAgreementData = customerAgreementMetadata.every(item => !!item);

        // Per the product requirements, we only want to attempt requesting an auto-applied license
        // when the enterprise customer has an SSO/LMS provider configured.
        if (!result && enterpriseIdentityProvider && hasCustomerAgreementData) {
          result = await requestAutoAppliedUserLicense(customerAgreementConfig.uuid);
        }
      }

      return result;
    }
    if (!isLoadingCustomerAgreementConfig) {
      setIsLoading(true);

      retrieveUserLicense().then((userLicense) => {
        const subscriptionPlan = customerAgreementConfig?.subscriptions?.find(
          subscription => subscription.uuid === userLicense?.subscriptionPlanUuid,
        );

        setLicense({
          ...userLicense,
          subscriptionPlan,
        });

        setIsLoading(false);
      });
    }
  }, [isLoadingCustomerAgreementConfig]);

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

export function useCustomerAgreementData(enterpriseId) {
  const [customerAgreement, setCustomerAgreement] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerAgreementData(enterpriseId)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        // Note: customer agreements are unique, only 1 can exist per customer
        if (results.length) {
          setCustomerAgreement(results[0]);
        } else {
          setCustomerAgreement(null);
        }
      })
      .catch(() => {
        setCustomerAgreement(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [enterpriseId]);

  return [customerAgreement, isLoading];
}

export function useCatalogData(enterpriseId) {
  const [catalogData, setCatalogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await fetchEnterpriseCatalogData(enterpriseId);
        setCatalogData(response.data);
      } catch {
        setCatalogData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [enterpriseId]);

  return [catalogData, isLoading];
}
