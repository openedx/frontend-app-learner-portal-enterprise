import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { getAcademies, getAcademyMetadata } from './service';

export function useAcademyMetadata(academyUUID) {
  const [academyMetadata, setAcademyMetadata] = useState({});
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAcademyMetadata(academyUUID);
        setAcademyMetadata(data);
        setIsLoading(false);
      } catch (error) {
        logError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [academyUUID]);

  return [academyMetadata, isLoading, fetchError];
}

export const useAcademies = (enterpriseCustomerUUID) => {
  const [academies, setAcademies] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAcademies(enterpriseCustomerUUID);
        setAcademies(data);
      } catch (error) {
        logError(error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enterpriseCustomerUUID]);

  return [academies, isLoading, fetchError];
};
