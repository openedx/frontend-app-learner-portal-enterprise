import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';

import { getAcademies, getAcademyMetadata } from './service';
import LearnerPathwayService from '../../pathway/data/service';

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
