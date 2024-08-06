import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import useCourseMetadata from './useCourseMetadata';
import { queryCanRedeem } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useRedeemablePolicies from './useRedeemablePolicies';
import { filterCourseMetadataByAllocationCourseRun } from '../utils';

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
  const listPrice = redeemabilityForActiveCourseRun?.listPrice?.usd;
  // TODO: Update to properly handle allocated course run state
  const hasSuccessfulRedemption = courseRunKey
    ? !!canRedeemData.find(r => r.contentKey === courseRunKey)?.hasSuccessfulRedemption
    : canRedeemData.some(r => r.hasSuccessfulRedemption);

  // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
  // redeemable subsidy access policy for any of the content keys.
  const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || otherSubsidyAccessPolicy;
  const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;
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
  const { courseRunKey, courseKey } = useParams();
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const { data: courseMetadata } = useCourseMetadata();
  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();
  const updatedCourseMetadata = filterCourseMetadataByAllocationCourseRun({
    redeemableLearnerCreditPolicies,
    courseMetadata,
    courseKey,
  });
  return useQuery({
    ...queryCanRedeem(enterpriseCustomer.uuid, updatedCourseMetadata, lateEnrollmentBufferDays),
    enabled: !!updatedCourseMetadata,
    select: (data) => {
      const transformedData = transformCourseRedemptionEligibility({
        courseMetadata: updatedCourseMetadata,
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
