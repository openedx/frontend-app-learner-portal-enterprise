import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { isRunUnrestrictedForCatalog } from '../utils';
import useCourseMetadata from './useCourseMetadata';
import { queryCanRedeem } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useEnterpriseCustomerContainsContent from './useEnterpriseCustomerContainsContent';

const getContentListPriceRange = ({ courseRuns }) => {
  const flatContentPrice = courseRuns.flatMap(run => run.listPrice?.usd).filter(x => !!x);
  // Find the max and min prices
  if (!flatContentPrice.length) {
    return [];
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
  restrictedRunsAllowed,
}) {
  // Begin by excluding restricted runs that should not be visible to the requester.
  // This filtering does not control visibility of individual course runs, but
  // it does serve as input to the determination of redemption eligiblity.
  const unrestrictedCanRedeemData = canRedeemData.filter(canRedeemRun => isRunUnrestrictedForCatalog({
    restrictedRunsAllowed,
    courseKey: courseMetadata.key,
    courseRunMetadata: courseMetadata.availableCourseRuns.find(r => r.key === canRedeemRun.contentKey),
    catalogUuid: canRedeemRun.redeemableSubsidyAccessPolicy?.catalogUuid,
  }));
  const redeemabilityForActiveCourseRun = unrestrictedCanRedeemData.find(
    r => r.contentKey === courseMetadata.activeCourseRun?.key,
  );
  const missingSubsidyAccessPolicyReason = redeemabilityForActiveCourseRun?.reasons[0];
  const preferredSubsidyAccessPolicy = redeemabilityForActiveCourseRun?.redeemableSubsidyAccessPolicy;
  const anyRedeemableSubsidyAccessPolicy = unrestrictedCanRedeemData.find(
    r => r.redeemableSubsidyAccessPolicy,
  )?.redeemableSubsidyAccessPolicy;
  const listPrice = getContentListPriceRange({ courseRuns: canRedeemData });
  const hasSuccessfulRedemption = courseRunKey
    ? !!unrestrictedCanRedeemData.find(r => r.contentKey === courseRunKey)?.hasSuccessfulRedemption
    : unrestrictedCanRedeemData.some(r => r.hasSuccessfulRedemption);

  // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
  // redeemable subsidy access policy for any of the content keys.
  const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || anyRedeemableSubsidyAccessPolicy;
  const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;
  return {
    isPolicyRedemptionEnabled,
    redeemabilityPerContentKey: unrestrictedCanRedeemData,
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
  const { data: { restrictedRunsAllowed } } = useEnterpriseCustomerContainsContent([courseMetadata.key]);
  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();

  return useQuery({
    ...queryCanRedeem(enterpriseCustomer.uuid, courseMetadata, lateEnrollmentBufferDays),
    enabled: !!courseMetadata,
    select: (data) => {
      const transformedData = transformCourseRedemptionEligibility({
        courseMetadata,
        canRedeemData: data,
        courseRunKey,
        restrictedRunsAllowed,
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
