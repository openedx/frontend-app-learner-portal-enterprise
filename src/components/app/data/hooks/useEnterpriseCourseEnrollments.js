import { useQuery } from '@tanstack/react-query';

import { makeEnterpriseCourseEnrollmentsQuery } from '../../routes/queries';
import useEnterpriseLearner from './useEnterpriseLearner';

/**
 * Retrieves the enterprise course enrollments for the active enterprise customer user.
 * @returns {Types.UseQueryResult}} The query results for the enterprise course enrollments.
 */
export default function useEnterpriseCourseEnrollments() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    makeEnterpriseCourseEnrollmentsQuery(enterpriseId),
  );
}