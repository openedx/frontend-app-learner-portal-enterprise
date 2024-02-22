import { AppContext } from '@edx/frontend-platform/react';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { makeEnterpriseLearnerQuery } from '../../routes/queries';

/**
 * Retrieves the enterprise learner data for the authenticated user.
 *
 * @returns {Types.UseQueryResult} The query results for the enterprise learner data.
 */
export default function useEnterpriseLearner() {
  const { authenticatedUser } = useContext(AppContext);
  const { enterpriseSlug } = useParams();
  return useQuery(
    makeEnterpriseLearnerQuery(authenticatedUser.username, enterpriseSlug),
  );
}
