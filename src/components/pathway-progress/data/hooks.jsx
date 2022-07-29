import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getPathwayProgressDetails } from './service';

export function useLearnerPathwayProgressData(pathwayUUID) {
  const [pathwayProgressData, setPathwayProgressData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (pathwayUUID) {
        try {
          const data = await getPathwayProgressDetails(pathwayUUID);
          setPathwayProgressData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
    };
    fetchData();
  }, [pathwayUUID]);
  return [camelCaseObject(pathwayProgressData), fetchError];
}
