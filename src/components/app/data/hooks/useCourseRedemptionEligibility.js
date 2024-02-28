import { useQuery } from '@tanstack/react-query';

import useCourseMetadata from './useCourseMetadata';
import useEnterpriseLearner from './useEnterpriseLearner';
import { queryCanRedeem } from '../../routes/data/services';

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course redemption eligibility.
 */
export default function useCourseRedemptionEligibility() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const { data: courseMetadata } = useCourseMetadata();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    queryCanRedeem(enterpriseId, courseMetadata),
  );
}
