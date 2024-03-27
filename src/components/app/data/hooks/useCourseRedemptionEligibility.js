import { useQuery } from '@tanstack/react-query';

import useCourseMetadata from './useCourseMetadata';
import { queryCanRedeem } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useLateRedemptionEnrollableBufferDays from './useLateRedemptionBufferDays';

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course redemption eligibility.
 */
export default function useCourseRedemptionEligibility(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();
  const isEnrollableBufferDays = useLateRedemptionEnrollableBufferDays();

  return useQuery({
    ...queryOptionsRest,
    ...queryCanRedeem(enterpriseCustomer.uuid, courseMetadata, isEnrollableBufferDays),
    select: (data) => {
      if (select) {
        return select(data);
      }
      const redeemabilityForActiveCourseRun = data.find(r => r.contentKey === courseMetadata.activeCourseRun?.key);
      const missingSubsidyAccessPolicyReason = redeemabilityForActiveCourseRun?.reasons[0];
      const preferredSubsidyAccessPolicy = redeemabilityForActiveCourseRun?.redeemableSubsidyAccessPolicy;
      const otherSubsidyAccessPolicy = data.find(
        r => r.redeemableSubsidyAccessPolicy,
      )?.redeemableSubsidyAccessPolicy;
      const listPrice = redeemabilityForActiveCourseRun?.listPrice?.usd;
      const hasSuccessfulRedemption = data.some(r => r.hasSuccessfulRedemption);

      // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
      // redeemable subsidy access policy for any of the content keys.
      const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || otherSubsidyAccessPolicy;
      const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;

      return {
        isPolicyRedemptionEnabled,
        redeemabilityPerContentKey: data,
        redeemableSubsidyAccessPolicy,
        missingSubsidyAccessPolicyReason,
        hasSuccessfulRedemption,
        listPrice,
      };
    },
  });
}
