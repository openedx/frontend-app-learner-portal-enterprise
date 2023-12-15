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
  const [currentEnterpriseOffers, setCurrentEnterpriseOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [canEnrollWithEnterpriseOffers, setCanEnrollWithEnterpriseOffers] = useState(false);
  const [hasCurrentEnterpriseOffers, setHasCurrentEnterpriseOffers] = useState(false);
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

    if (enterpriseOffers.length > 0) {
      setCanEnrollWithEnterpriseOffers(true);
    }

    const currentEntOffers = enterpriseOffers.filter(offer => offer.isCurrent);
    if (currentEntOffers.length > 0) {
      setCurrentEnterpriseOffers(currentEntOffers);
      setHasCurrentEnterpriseOffers(true);
      const hasLowBalance = currentEntOffers.some(offer => offer.isLowOnBalance);
      const hasNoBalance = currentEntOffers.every(offer => offer.isOutOfBalance);
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
    currentEnterpriseOffers,
    hasCurrentEnterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    isLoading: isLoadingOffers,
  };
};
