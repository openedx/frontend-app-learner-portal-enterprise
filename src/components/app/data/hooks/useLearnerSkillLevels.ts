import { useQuery } from '@tanstack/react-query';
import { queryLearnerSkillLevels } from '../queries';

/**
 * Hook to get the learner skill levels for a job
 * @param {string} jobId
 * @returns Query results for the learner skill levels
 */
export default function useLearnerSkillLevels(jobId) {
  return useQuery({
    ...queryLearnerSkillLevels(jobId),
  });
}
