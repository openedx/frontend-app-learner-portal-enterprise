import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import LearnerPathwayService from '../../pathway/data/service';

export const useAcademyPathwayData = (academyUUID, courseIndex) => {
  const [pathway, setPathway] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchPathway = async () => {
      setIsLoading(true);
      try {
        const { hits: pathwayHits, nbHits: nbPathwayHits } = await courseIndex.search('', {
          filters: `(content_type:learnerpathway) AND academy_uuids:${academyUUID}`,
          hitsPerPage: 1,
          page: 0,
        });
        // for now we have only one pathway per academy
        if (nbPathwayHits > 0 && pathwayHits[0]?.uuid) {
          const learnerPathwayUuid = pathwayHits[0].uuid;
          const learnerPathwayService = new LearnerPathwayService({ learnerPathwayUuid });
          const data = await learnerPathwayService.fetchLearnerPathwayData();
          setPathway({ title: data?.title, overview: data?.overview, pathwayUuid: learnerPathwayUuid });
        } else {
          setPathway({});
        }
      } catch (error) {
        setFetchError(error);
        logError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPathway();
  }, [academyUUID, courseIndex]);

  return [pathway, isLoading, fetchError];
};
