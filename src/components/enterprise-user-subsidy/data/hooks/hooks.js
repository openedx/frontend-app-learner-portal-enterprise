import {
  useEffect, useMemo, useReducer, useState,
} from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useQuery } from '@tanstack/react-query';

import { fetchCouponCodeAssignments } from '../../coupons';
import couponCodesReducer, { initialCouponCodesState } from '../../coupons/data/reducer';

import { enterpriseUserSubsidyQueryKeys, LICENSE_STATUS } from '../constants';
import {
  fetchCustomerAgreementData,
  fetchRedeemableLearnerCreditPolicies,
  fetchSubscriptionLicensesForUser,
} from '../service';
import { features } from '../../../../config';
import { fetchCouponsOverview } from '../../coupons/data/service';
import { getAssignmentsByState, transformRedeemablePoliciesData } from '../utils';

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
 * Retrieves a license for the authenticated user, if applicable. First attempts to find any existing licenses
 * for the user. If a license is found, the app uses it.
 *
 * @param {object} args
 * @param {object} args.enterpriseCustomer The enterprise customer config
 * @param {object} args.customerAgreementConfig The customer agreement config associated with the enterprise
 * @param {boolean} args.isLoadingCustomerAgreementConfig Whether the customer agreement is still resolving
 * @param {object} args.user The authenticated user
 * @returns Object containing a user license, if applicable, whether the license data is still resolving, and a callback
 *          to activate the user license.
 */
export function useSubscriptionLicense({
  enterpriseCustomer,
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
    enterpriseId: enterpriseCustomer.uuid,
    enterpriseIdentityProvider: enterpriseCustomer.identityProvider,
  }), [enterpriseCustomer]);

  useEffect(() => {
    async function retrieveUserLicense() {
      const result = await fetchExistingUserLicense(enterpriseId);
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

  return { license, isLoading };
}

/**
 * Given an enterprise UUID, returns overview of coupons associated with the enterprise
 * and a list of coupon codes assigned to the authenticated user.
 */
export function useCouponCodes(enterpriseId) {
  const [state, dispatch] = useReducer(couponCodesReducer, initialCouponCodesState);

  const couponsOverviewQueryData = useQuery({
    queryKey: ['coupons', 'overview', enterpriseId],
    queryFn: async () => {
      const response = await fetchCouponsOverview({ enterpriseId });
      return camelCaseObject(response.data);
    },
  });
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

  const result = useMemo(() => {
    const updatedState = {
      ...state,
      couponsOverview: couponsOverviewQueryData,
      loading: state.loading || couponsOverviewQueryData.isLoading,
    };
    return [updatedState, updatedState.loading];
  }, [state, couponsOverviewQueryData]);

  return result;
}

export function useCustomerAgreementData(enterpriseId) {
  const [customerAgreement, setCustomerAgreement] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerAgreementData(enterpriseId)
      .then((response) => {
        const { results } = camelCaseObject(response.data);
        // Note: customer agreements are unique, only 1 can exist per customer
        setCustomerAgreement(results[0] || null);
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

const getRedeemablePoliciesData = async ({ queryKey }) => {
  const enterpriseId = queryKey[3];
  const userID = queryKey[4];
  const response = await fetchRedeemableLearnerCreditPolicies(enterpriseId, userID);
  const responseData = camelCaseObject(response.data);
  const redeemablePolicies = transformRedeemablePoliciesData(responseData);
  const learnerContentAssignments = getAssignmentsByState(
    redeemablePolicies?.flatMap(item => item.learnerContentAssignments || []),
  );
  return {
    redeemablePolicies,
    learnerContentAssignments,
  };
};

export function useRedeemableLearnerCreditPolicies(enterpriseId, userID) {
  return useQuery({
    queryKey: enterpriseUserSubsidyQueryKeys.redeemablePolicies(enterpriseId, userID),
    queryFn: getRedeemablePoliciesData,
    onError: (error) => {
      logError(error);
    },
  });
}
