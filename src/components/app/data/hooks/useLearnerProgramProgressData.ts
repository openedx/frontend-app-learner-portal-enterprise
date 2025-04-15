import { useParams } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryLearnerProgramProgressData } from '../queries';

export default function useLearnerProgramProgressData() {
  const params = useParams();
  const programUUID = params.programUUID!;
  return useSuspenseQuery({
    ...queryLearnerProgramProgressData(programUUID),
  });
}
