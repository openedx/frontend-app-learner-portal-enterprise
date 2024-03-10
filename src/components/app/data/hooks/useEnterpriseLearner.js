import { AppContext } from '@edx/frontend-platform/react';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { queryEnterpriseLearner } from '../queries';

/**
 * Retrieves the enterprise learner data for the authenticated user.
 * @param {Types.UseQueryOptions} queryOptions - The query options.
 * @returns {Types.UseQueryResult} The query results for the enterprise learner data.
 */
export default function useEnterpriseLearner(queryOptions = {}) {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  return useQuery({
    ...queryOptions,
    ...queryEnterpriseLearner(authenticatedUser.username, enterpriseSlug),
  });
}
