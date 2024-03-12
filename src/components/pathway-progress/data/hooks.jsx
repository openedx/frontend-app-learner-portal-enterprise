import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getPathwayProgressDetails, fetchInProgressPathways } from './service';

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

export function useInProgressPathwaysData(enterpriseUuid) {
  const [pathwayProgressData, setPathwayProgressData] = useState([]);
  const [pathwayFetchError, setPathwayFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (enterpriseUuid) {
        try {
          const { data } = await fetchInProgressPathways(enterpriseUuid);
          setPathwayProgressData(data.results);
        } catch (error) {
          logError(error);
          setPathwayFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [enterpriseUuid]);
  return [camelCaseObject(pathwayProgressData), pathwayFetchError];
}
