import {
  useState, useEffect, useReducer, useCallback, useMemo,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { fetchCouponCodeAssignments } from '../coupons';
import couponCodesReducer, { initialCouponCodesState } from '../coupons/data/reducer';

import { LICENSE_STATUS } from './constants';
import {
  fetchSubscriptionLicensesForUser,
  fetchCustomerAgreementData,
  requestAutoAppliedLicense,
  activateLicense,
} from './service';
import { features } from '../../../config';

/**
 * Attempts to fetch any existing licenses associated with the authenticated user and the
 * specified enterprise customer. Priority is given to activated licenses, then assigned
 * licenses.
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
  } catch (error) {
    logError(error);
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
  } catch (error) {
    logError(error);
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
 * @param {object} args.user The authenticated user
 * @returns Object containing a user license, if applicable, whether the license data is still resolving, and a callback
 *          to activate the user license.
 */
export function useSubscriptionLicense({
  enterpriseConfig,
  customerAgreementConfig,
  isLoadingCustomerAgreementConfig,
  user,
}) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const {
    enterpriseId,
    enterpriseIdentityProvider,
  } = useMemo(() => ({
    enterpriseId: enterpriseConfig.uuid,
    enterpriseIdentityProvider: enterpriseConfig.identityProvider,
  }), [enterpriseConfig]);

  useEffect(() => {
    async function retrieveUserLicense() {
      let result = await fetchExistingUserLicense(enterpriseId);

      if (features.ENABLE_AUTO_APPLIED_LICENSES) {
        const customerAgreementMetadata = [
          customerAgreementConfig?.uuid,
          customerAgreementConfig?.subscriptionForAutoAppliedLicenses,
        ];
        const hasCustomerAgreementData = customerAgreementMetadata.every(item => !!item);

        // Only request an auto-applied license if ther user is a learner of the enterprise.
        // This is mainly to prevent edx operators from accidently getting a license.
        const isEnterpriseLearner = !!user.roles.find(userRole => {
          const [role, enterprise] = userRole.split(':');
          return role === 'enterprise_learner' && enterprise === enterpriseId;
        });

        // Per the product requirements, we only want to attempt requesting an auto-applied license
        // when the enterprise customer has an SSO/LMS provider configured.
        if (!result && enterpriseIdentityProvider && isEnterpriseLearner && hasCustomerAgreementData) {
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

        if (userLicense) {
          setLicense({
            ...userLicense,
            subscriptionPlan,
          });
        } else {
          setLicense(null);
        }

        setIsLoading(false);
      });
    }
  }, [customerAgreementConfig, enterpriseId, enterpriseIdentityProvider, isLoadingCustomerAgreementConfig, user]);

  const activateUserLicense = useCallback(async (autoActivated = false) => {
    try {
      await activateLicense(license.activationKey);

      sendEnterpriseTrackEvent(
        enterpriseId,
        'edx.ui.enterprise.learner_portal.license-activation.license-activated',
        {
          autoActivated,
        },
      );

      setLicense({
        ...license,
        status: LICENSE_STATUS.ACTIVATED,
      });
    } catch (error) {
      logError(error);
      throw error;
    }
  }, [enterpriseId, license]);

  return { license, isLoading, activateUserLicense };
}

export function useCouponCodes(enterpriseId) {
  const [state, dispatch] = useReducer(couponCodesReducer, initialCouponCodesState);

  useEffect(
    () => {
      if (features.ENROLL_WITH_CODES) {
        fetchCouponCodeAssignments(
          {
            enterprise_uuid: enterpriseId,
            full_discount_only: 'True', // Must be a string because the API does a string compare not a true JSON boolean compare.
            is_active: 'True',
          },
          dispatch,
        );
      }
    },
    [enterpriseId],
  );

  return [state, state.loading];
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
      .catch((error) => {
        logError(new Error(error));
        setCustomerAgreement(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [enterpriseId]);

  return [customerAgreement, isLoading];
}
