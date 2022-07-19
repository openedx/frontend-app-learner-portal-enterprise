import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import LearnerPathwayService from './service';

// eslint-disable-next-line import/prefer-default-export
export function useLearnerPathwayData({ learnerPathwayUuid }) {
  const [learnerPathwayData, setLearnerPathwayData] = useState({});
  const [fetchError, setFetchError] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (learnerPathwayUuid) {
        const learnerPathwayService = new LearnerPathwayService({ learnerPathwayUuid });
        try {
          const data = await learnerPathwayService.fetchLearnerPathwayData();
          setLearnerPathwayData(data);
          setIsLoading(false);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [learnerPathwayUuid]);

  return [learnerPathwayData, isLoading, fetchError];
}
