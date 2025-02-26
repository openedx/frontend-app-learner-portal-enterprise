import { AppContext } from '@edx/frontend-platform/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';

export interface UseEnterpriseLearnerOptions<TData> {
  select?: (data: Types.EnterpriseLearnerData) => TData;
}

/**
 * Retrieves the enterprise learner data for the authenticated user.
 */
export default function useEnterpriseLearner<
  TData = Types.EnterpriseLearnerData,
>(options: UseEnterpriseLearnerOptions<TData> = {}) {
  const { authenticatedUser }: Types.AppContextValue = useContext(AppContext);
  const { select } = options;
  const { enterpriseSlug } = useParams();
  return useSuspenseQuery<Types.EnterpriseLearnerData, unknown, TData>({
    ...queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
    select,
  });
}
