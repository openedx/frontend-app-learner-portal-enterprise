import {
  useState, useEffect, useReducer,
} from 'react';

import { fetchOffers } from '../offers';
import offersReducer, { initialOfferState } from '../offers/data/reducer';

import {
  fetchEnterpriseCatalogData,
} from './service';
import { features } from '../../../config';

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
