import {
  useState,
  useEffect,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { fetchCouponsOverview } from '../../coupons/data/service';
import { features } from '../../../../config';

export function useEnterpriseOffers({
  enterpriseId,
  customerAgreementConfig,
  isLoadingCustomerAgreementConfig,
}) {
  const [enterpriseOffers, setEnterpriseOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingEnterpriseCoupons, setIsLoadingEnterpriseCoupons] = useState(true);
  const [enterpriseCoupons, setEnterpriseCoupons] = useState([]);
  const [canEnrollWithEnterpriseOffers, setCanEnrollWithEnterpriseOffers] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [hasLowEnterpriseOffersBalance, setHasLowEnterpriseOffersBalance] = useState(false);

  const isLoading = isLoadingOffers || isLoadingCustomerAgreementConfig || isLoadingEnterpriseCoupons;

  useEffect(() => {
    // Fetch enterprise offers here if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS is true
    setEnterpriseOffers([]);
    setIsLoadingOffers(false);

    // Check if offers are low on balance
    // hasLowEnterpriseOffersBalance(true)
  }, [enterpriseId]);

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

    if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
      fetchEnterpriseCoupons();
    } else {
      setIsLoadingEnterpriseCoupons(false);
    }
  }, [enterpriseId]);

  useEffect(() => {
    if (isLoading || !features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
      return;
    }

    // might also add enterpriseOffers.length === 1 depending on requirements
    if (enterpriseCoupons.length === 0
       && (customerAgreementConfig?.subscriptions?.length || 0) === 0) {
      setCanEnrollWithEnterpriseOffers(true);
    }
  }, [
    isLoading,
    enterpriseCoupons,
    customerAgreementConfig,
    isLoadingCustomerAgreementConfig,
    features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS,
  ]);

  return {
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    isLoading,
  };
}
