import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryProgramDetails } from '../queries';

export default function useProgramProgressDetails(queryOptions = {}) {
  const params = useParams();
  return useQuery({
    ...queryProgramDetails(params.programUUID),
    ...queryOptions,
  });
}
