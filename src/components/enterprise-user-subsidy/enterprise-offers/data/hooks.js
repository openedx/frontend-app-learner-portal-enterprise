import {
  useState,
  useEffect,
} from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { features } from '../../../../config';
import * as enterpriseOffersService from './service';
import { transformEnterpriseOffer } from './utils';

export const useEnterpriseOffers = ({
  enterpriseId,
  enableLearnerPortalOffers,
}) => {
  const [enterpriseOffers, setEnterpriseOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [canEnrollWithEnterpriseOffers, setCanEnrollWithEnterpriseOffers] = useState(false);
  const [hasLowEnterpriseOffersBalance, setHasLowEnterpriseOffersBalance] = useState(false);
  const [hasNoEnterpriseOffersBalance, setHasNoEnterpriseOffersBalance] = useState(false);

  const enableOffers = features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS && enableLearnerPortalOffers;

  useEffect(() => {
    // Fetch enterprise offers here if features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS is true
    const fetchEnterpriseOffers = async () => {
      try {
        const response = await enterpriseOffersService.fetchEnterpriseOffers(enterpriseId);
        const { results } = camelCaseObject(response.data);
        setEnterpriseOffers(results.map(offer => transformEnterpriseOffer(offer)));
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

  useEffect(() => {
    if (!enableOffers || isLoadingOffers) {
      return;
    }

    const currentEnterpriseOffers = enterpriseOffers.filter(offer => offer.isCurrent);
    if (currentEnterpriseOffers.length > 0) {
      const hasLowBalance = currentEnterpriseOffers.some(offer => offer.isLowOnBalance);
      const hasNoBalance = currentEnterpriseOffers.every(offer => offer.isOutOfBalance);

      setCanEnrollWithEnterpriseOffers(true);
      setHasLowEnterpriseOffersBalance(hasLowBalance);
      setHasNoEnterpriseOffersBalance(hasNoBalance);
    }
  }, [
    isLoadingOffers,
    enableOffers,
    enterpriseOffers,
  ]);

  return {
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    isLoading: isLoadingOffers,
  };
};
