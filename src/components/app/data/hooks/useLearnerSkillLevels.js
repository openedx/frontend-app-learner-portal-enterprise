import { useQuery } from '@tanstack/react-query';
import { queryLearnerSkillLevels } from '../queries';

/**
 * Hook to get the learner skill levels for a job
 * @param {string} jobId
 * @param {object} [queryOptions] Additional query options
 * @returns Query results for the learner skill levels
 */
export default function useLearnerSkillLevels(jobId, queryOptions = {}) {
  return useQuery({
    ...queryLearnerSkillLevels(jobId),
    ...queryOptions,
  });
}
