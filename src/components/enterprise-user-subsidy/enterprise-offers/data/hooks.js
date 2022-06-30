import {
  useState,
  useEffect,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { fetchCouponsOverview } from '../../coupons/data/service';
import { features } from '../../../../config';
import * as enterpriseOffersService from './service';
import { ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD } from './constants';
import { hasValidStartExpirationDates } from '../../../../utils/common';

export function useEnterpriseOffers({
  enterpriseId,
  enableLearnerPortalOffers,
  customerAgreementConfig,
  isLoadingCustomerAgreementConfig,
}) {
  const [enterpriseOffers, setEnterpriseOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingEnterpriseCoupons, setIsLoadingEnterpriseCoupons] = useState(true);
  const [enterpriseCoupons, setEnterpriseCoupons] = useState([]);
  const [canEnrollWithEnterpriseOffers, setCanEnrollWithEnterpriseOffers] = useState(false);
  const [hasLowEnterpriseOffersBalance, setHasLowEnterpriseOffersBalance] = useState(false);

  const enableOffers = features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS && enableLearnerPortalOffers;

  const isLoading = isLoadingOffers || isLoadingCustomerAgreementConfig || isLoadingEnterpriseCoupons;

  useEffect(() => {
    // Fetch enterprise offers here if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS is true
    const fetchEnterpriseOffers = async () => {
      try {
        const response = await enterpriseOffersService.fetchEnterpriseOffers(enterpriseId);
        const { results } = camelCaseObject(response.data);
        setEnterpriseOffers(results);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    if (enableOffers) {
      fetchEnterpriseOffers();
    } else {
      setIsLoadingOffers(false);
    }
  }, [enterpriseId, enableOffers]);

  // Fetch enterprise coupons to determine if the enterprise offers can be used to enroll
  useEffect(() => {
    const fetchEnterpriseCoupons = async () => {
      try {
        const response = await fetchCouponsOverview(
          { enterpriseId },
        );
        const { results } = camelCaseObject(response.data);
        setEnterpriseCoupons(results);
      } catch (error) {
        logError(error);
      } finally {
        setIsLoadingEnterpriseCoupons(false);
      }
    };

    if (enableOffers) {
      fetchEnterpriseCoupons();
    } else {
      setIsLoadingEnterpriseCoupons(false);
    }
  }, [enableOffers, enterpriseId]);

  useEffect(() => {
    if (!enableOffers || isLoading) {
      return;
    }

    const enterpriseHasActiveCoupons = enterpriseCoupons.length > 0;
    const enterpriseHasActiveSubscription = !!(customerAgreementConfig?.subscriptions ?? []).find(({
      startDate,
      expirationDate,
    }) => hasValidStartExpirationDates({
      startDate,
      expirationDate,
    }));

    // For MVP we will only support enterprises with one active offer
    const enterpriseHasOneOffer = enterpriseOffers.length === 1;

    if (enterpriseHasActiveCoupons || enterpriseHasActiveSubscription || !enterpriseHasOneOffer) {
      return;
    }

    setCanEnrollWithEnterpriseOffers(true);
    setHasLowEnterpriseOffersBalance(enterpriseOffers[0].remainingBalance <= ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD);
  }, [
    isLoading,
    enterpriseCoupons,
    customerAgreementConfig,
    isLoadingCustomerAgreementConfig,
    enableOffers,
  ]);

  return {
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    isLoading,
  };
}
