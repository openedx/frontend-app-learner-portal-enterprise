import { useQuery } from '@tanstack/react-query';

import { makeCanRedeemQuery } from '../../routes/queries';
import useCourseMetadata from './useCourseMetadata';
import useEnterpriseLearner from './useEnterpriseLearner';

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course redemption eligibility.
 */
export default function useCourseRedemptionEligibility() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const { data: courseMetadata } = useCourseMetadata();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    makeCanRedeemQuery(enterpriseId, courseMetadata),
  );
}
