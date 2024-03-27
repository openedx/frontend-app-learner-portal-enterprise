import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryLearnerProgramProgressData } from '../queries';

export default function useLearnerProgramProgressData(queryOptions = {}) {
  const { programUUID } = useParams();
  return useQuery({
    ...queryLearnerProgramProgressData(programUUID),
    ...queryOptions,
  });
}
