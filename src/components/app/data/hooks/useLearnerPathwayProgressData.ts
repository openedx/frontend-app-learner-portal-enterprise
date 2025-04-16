import { useParams } from 'react-router-dom';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { queryLearnerPathwayProgressData } from '../queries';

export default function useLearnerPathwayProgressData() {
  const params = useParams();
  const pathwayUUID = params.pathwayUUID!;
  return useSuspenseQuery(
    queryOptions({
      ...queryLearnerPathwayProgressData(pathwayUUID),
    }),
  );
}
