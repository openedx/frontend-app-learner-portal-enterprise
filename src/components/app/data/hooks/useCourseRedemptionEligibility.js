import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import useCourseMetadata from './useCourseMetadata';
import { queryCanRedeem } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';

const getContentListPrice = ({ courseRuns }) => {
  const flatContentPrice = courseRuns.flatMap(run => run.listPrice?.usd).filter(x => !!x);
  // Find the max and min prices
  if (!flatContentPrice.length) {
    return null;
  }
  const maxPrice = Math.max(...flatContentPrice);
  const minPrice = Math.min(...flatContentPrice);
  // Heuristic for displaying the price as a range or a singular price based on runs
  if (maxPrice !== minPrice) {
    return [minPrice, maxPrice];
  }
  return [flatContentPrice[0]];
};

export function transformCourseRedemptionEligibility({
  courseMetadata,
  canRedeemData,
  courseRunKey,
}) {
  const redeemabilityForActiveCourseRun = canRedeemData.find(r => r.contentKey === courseMetadata.activeCourseRun?.key);
  const missingSubsidyAccessPolicyReason = redeemabilityForActiveCourseRun?.reasons[0];
  const preferredSubsidyAccessPolicy = redeemabilityForActiveCourseRun?.redeemableSubsidyAccessPolicy;
  const otherSubsidyAccessPolicy = canRedeemData.find(
    r => r.redeemableSubsidyAccessPolicy,
  )?.redeemableSubsidyAccessPolicy;
  const listPrice = getContentListPrice({ courseRuns: canRedeemData });
  const hasSuccessfulRedemption = courseRunKey
    ? !!canRedeemData.find(r => r.contentKey === courseRunKey)?.hasSuccessfulRedemption
    : canRedeemData.some(r => r.hasSuccessfulRedemption);

  // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
  // redeemable subsidy access policy for any of the content keys.
  const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || otherSubsidyAccessPolicy;
  const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;
  console.log(listPrice);
  return {
    isPolicyRedemptionEnabled,
    redeemabilityPerContentKey: canRedeemData,
    redeemableSubsidyAccessPolicy,
    missingSubsidyAccessPolicyReason,
    hasSuccessfulRedemption,
    listPrice,
  };
}

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course redemption eligibility.
 */
export default function useCourseRedemptionEligibility(queryOptions = {}) {
  const { courseRunKey } = useParams();
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();
  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();

  return useQuery({
    ...queryCanRedeem(enterpriseCustomer.uuid, courseMetadata, lateEnrollmentBufferDays),
    enabled: !!courseMetadata,
    select: (data) => {
      const transformedData = transformCourseRedemptionEligibility({
        courseMetadata,
        canRedeemData: data,
        courseRunKey,
      });
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
    ...queryOptionsRest,
  });
}
