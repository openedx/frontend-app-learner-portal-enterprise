import { AppContext } from '@edx/frontend-platform/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';

export interface UseEnterpriseLearnerOptions<TData> {
  select?: (data: EnterpriseLearnerData) => TData;
}

/**
 * Retrieves the enterprise learner data for the authenticated user.
 */
export default function useEnterpriseLearner<
  TData = EnterpriseLearnerData,
>(options: UseEnterpriseLearnerOptions<TData> = {}) {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const { select } = options;
  const { enterpriseSlug } = useParams();
  return useSuspenseQuery<EnterpriseLearnerData, unknown, TData>({
    ...queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
    select,
  });
}
