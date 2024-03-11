import { useQuery } from '@tanstack/react-query';
import { queryLearnerSkillLevels } from '../queries';

/**
 * Hook to get the learner skill levels for a job
 * @param {string} jobId
 * @param {Object} [queryOptions] Additional query options
 * @returns {Types.QueryResult}
 */
export default function useLearnerSkillLevels(jobId, queryOptions = {}) {
  return useQuery({
    ...queryLearnerSkillLevels(jobId),
    ...queryOptions,
  });
}
