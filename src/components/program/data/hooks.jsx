import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import ProgramService from './service';

export function useAllProgramData({ enterpriseUuid, programUuid }) {
  const [programData, setProgramData] = useState();
  const [fetchError, setFetchError] = useState();

  useEffect(() => {
    const fetchProgramData = async () => {
      if (programUuid) {
        const programService = new ProgramService({ enterpriseUuid, programUuid });
        try {
          const data = await programService.fetchAllProgramData();
          setProgramData(data);
        } catch (error) {
          logError(error);
          setFetchError(error);
        }
      }
      return undefined;
    };
    fetchProgramData();
  }, [enterpriseUuid, programUuid]);

  return [camelCaseObject(programData), fetchError];
}
