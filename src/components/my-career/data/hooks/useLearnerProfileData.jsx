import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';
import { getLearnerProfileInfo } from '../service';

export default function useLearnerProfileData(username) {
  const [isLoading, setIsLoading] = useState(false);
  const [learnerProfileData, setLearnerProfileData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (username) {
        try {
          const data = await getLearnerProfileInfo(username);
          setLearnerProfileData(camelCaseObject(data));
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [username]);
  return [learnerProfileData, fetchError, isLoading];
}
