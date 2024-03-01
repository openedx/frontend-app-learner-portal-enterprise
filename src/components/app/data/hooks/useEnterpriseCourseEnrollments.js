import { useQuery } from '@tanstack/react-query';

import useEnterpriseLearner from './useEnterpriseLearner';
import { queryEnterpriseCourseEnrollments } from '../../routes/data/queries';

/**
 * Retrieves the enterprise course enrollments for the active enterprise customer user.
 * @returns {Types.UseQueryResult}} The query results for the enterprise course enrollments.
 */
export default function useEnterpriseCourseEnrollments() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    queryEnterpriseCourseEnrollments(enterpriseId),
  );
}
