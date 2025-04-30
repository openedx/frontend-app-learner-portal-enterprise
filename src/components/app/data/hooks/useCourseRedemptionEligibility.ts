import { useParams } from 'react-router-dom';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { ENTERPRISE_RESTRICTION_TYPE } from '../../../../constants';
import useCourseMetadata from './useCourseMetadata';
import { queryCanRedeem } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import { determineSubscriptionLicenseApplicable, findCouponCodeForCourse, getCourseRunsForRedemption } from '../utils';
import useCourseRunKeyQueryParam from './useCourseRunKeyQueryParam';
import useRedeemablePolicies from './useRedeemablePolicies';
import useSubscriptions from './useSubscriptions';
import useCouponCodes from './useCouponCodes';
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
  courseRunsForRedemption,
}) {
  // Begin by excluding restricted runs that should not be visible to the requester.
  //
  // NOTE: This filtering does ultimately control the visibility of individual course runs
  // on the course about page IFF the applicable subsidy type is Learner Credit.
  const availableCourseRuns = courseRunsForRedemption.filter((courseRunMetadata) => {
    if (!courseRunMetadata.restrictionType) {
      // If a run is generally unrestricted, always show the run. Pre-filtering on the
      // upstream `courseMetadata.availableCourseRuns` already excluded runs that are
      // unpublished, unmarketable, etc.
      return true;
    }
    if (courseRunMetadata.restrictionType !== ENTERPRISE_RESTRICTION_TYPE) {
      // We completely do not support restricted runs that aren't of the enterprise
      // variety. unconditionally hide them from learners and pretend they do not exist.
      return false;
    }
    const canRedeemRunData = canRedeemData.find(r => r.contentKey === courseRunMetadata.key);
    return !!canRedeemRunData?.canRedeem || !!canRedeemRunData?.hasSuccessfulRedemption;
  });
  const availableCourseRunKeys = availableCourseRuns.map(r => r.key);
  // From here on, do not consider can-redeem responses for restricted runs that this
  // subsidy cannot currently redeem when determining if Learner Credit is eligible as the
  // applicable subsidy type. We don't want any existing redemption for a run that should
  // be hidden from THIS subsidy to throw off the calculation.
  const canRedeemDataForAvailableRuns = canRedeemData.filter(
    r => availableCourseRunKeys.includes(r.contentKey),
  );
  const redeemabilityForActiveCourseRun = canRedeemDataForAvailableRuns.find(
    r => r.contentKey === courseMetadata.activeCourseRun?.key,
  );
  const missingSubsidyAccessPolicyReason = redeemabilityForActiveCourseRun?.reasons[0];
  const preferredSubsidyAccessPolicy = redeemabilityForActiveCourseRun?.redeemableSubsidyAccessPolicy;
  const anyRedeemableSubsidyAccessPolicy = canRedeemDataForAvailableRuns.find(
    r => r.redeemableSubsidyAccessPolicy,
  )?.redeemableSubsidyAccessPolicy;
  const listPrice = getContentListPriceRange({ courseRuns: canRedeemData });
  const hasSuccessfulRedemption = courseRunKey
    ? !!canRedeemDataForAvailableRuns.find(r => r.contentKey === courseRunKey)?.hasSuccessfulRedemption
    : canRedeemDataForAvailableRuns.some(r => r.hasSuccessfulRedemption);

  // If there is a redeemable subsidy access policy for the active course run, use that. Otherwise, use any other
  // redeemable subsidy access policy for any of the content keys.
  const redeemableSubsidyAccessPolicy = preferredSubsidyAccessPolicy || anyRedeemableSubsidyAccessPolicy;
  const isPolicyRedemptionEnabled = hasSuccessfulRedemption || !!redeemableSubsidyAccessPolicy;
  return {
    isPolicyRedemptionEnabled,
    redeemabilityPerContentKey: canRedeemDataForAvailableRuns,
    availableCourseRuns,
    redeemableSubsidyAccessPolicy,
    missingSubsidyAccessPolicyReason,
    hasSuccessfulRedemption,
    listPrice,
  };
}

/**
 * Retrieves the course redemption eligibility for the given enterprise customer and course key.
 * @returns The query results for the course redemption eligibility.
 */
export default function useCourseRedemptionEligibility() {
  const { courseRunKey: courseRunKeyRouteParam } = useParams();
  const courseRunKeyQueryParam = useCourseRunKeyQueryParam();
  const courseRunKey = courseRunKeyRouteParam || courseRunKeyQueryParam;

  const { data: enterpriseCustomer } = useEnterpriseCustomer<EnterpriseCustomer>();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();
  const { data: courseMetadata } = useCourseMetadata();

  const {
    // @ts-expect-error
    data: { subscriptionLicense },
  } = useSubscriptions();

  const { courseKey } = useParams();
  const {
    data: {
      catalogList: catalogsWithCourse,
    },
  } = useEnterpriseCustomerContainsContent([courseKey!]);

  const {
    data: {
      couponCodeAssignments,
    },
  } = useCouponCodes();
  const applicableCouponCode = findCouponCodeForCourse(couponCodeAssignments, catalogsWithCourse);

  const isSubscriptionLicenseApplicable = determineSubscriptionLicenseApplicable(
    subscriptionLicense,
    catalogsWithCourse,
  );
  const hasSubsidyPrioritizedOverLearnerCredit = isSubscriptionLicenseApplicable
    || applicableCouponCode?.couponCodeRedemptionCount > 0;

  const {
    courseRuns: courseRunsForRedemption,
    courseRunKeys: courseRunKeysForRedemption,
  } = getCourseRunsForRedemption({
    course: courseMetadata,
    lateEnrollmentBufferDays,
    courseRunKey,
    redeemableLearnerCreditPolicies,
    hasSubsidyPrioritizedOverLearnerCredit,
  });

  return useQuery(
    queryOptions({
      ...queryCanRedeem(enterpriseCustomer.uuid, courseMetadata.key, courseRunKeysForRedemption),
      select: (data) => {
        // Among other things, transformCourseRedemptionEligibility() removes
        // restricted runs that fail the policy's can-redeem check.
        const transformedData = transformCourseRedemptionEligibility({
          courseMetadata,
          canRedeemData: data,
          courseRunKey,
          courseRunsForRedemption,
        });
        return transformedData;
      },
    }),
  );
}
