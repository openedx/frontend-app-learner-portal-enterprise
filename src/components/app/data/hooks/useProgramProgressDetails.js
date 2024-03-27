import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryProgramProgressDetails } from '../queries';

export default function useProgramProgressDetails(queryOptions = {}) {
  const { programUUID } = useParams();
  return useQuery({
    ...queryProgramProgressDetails(programUUID),
    ...queryOptions,
  });
}
