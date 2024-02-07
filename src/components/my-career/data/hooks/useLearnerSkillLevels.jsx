import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getLearnerSkillLevels } from '../service';

export default function useLearnerSkillLevels(jobId) {
  const [learnerSkillLevels, setLearnerSkillLevels] = useState();
  const [fetchError, setFetchError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (jobId) {
        try {
          const response = await getLearnerSkillLevels(jobId);
          setLearnerSkillLevels(response.data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      setIsLoading(false);
      return undefined;
    };
    fetchData();
  }, [jobId]);
  return [camelCaseObject(learnerSkillLevels), fetchError, isLoading];
}
