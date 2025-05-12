import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryLearnerSkillLevels } from '../queries';

/**
 * Hook to get the learner skill levels for a job
 * @returns Query results for the learner skill levels
 */
export default function useLearnerSkillLevels(jobId: string) {
  return useQuery(
    queryOptions({
      ...queryLearnerSkillLevels(jobId),
    }),
  );
}
