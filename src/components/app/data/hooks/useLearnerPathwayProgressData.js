import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryLearnerPathwayProgressData } from '../queries';

export default function useLearnerProgramProgressData(queryOptions = {}) {
  const { pathwayUUID } = useParams();
  return useQuery({
    ...queryLearnerPathwayProgressData(pathwayUUID),
    ...queryOptions,
  });
}
