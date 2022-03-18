import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { getLearnerProgramsList } from './service';

export function useLearnerProgramsListData(enterpriseUuid) {
  const [learnerProgramsListData, setLearnerProgramsListData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchData = async () => {
      if (enterpriseUuid) {
        try {
          const { data } = await getLearnerProgramsList(enterpriseUuid);
          setLearnerProgramsListData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchData();
  }, [enterpriseUuid]);
  return [camelCaseObject(learnerProgramsListData), fetchError];
}
