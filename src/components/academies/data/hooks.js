import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { getAcademyMetadata } from './service';

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
