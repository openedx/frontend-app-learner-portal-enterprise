import { useMemo } from 'react';
import { useParams } from 'react-router';
import {
  determineSubscriptionLicenseApplicable,
  findCouponCodeForCourse,
  getSubsidyToApplyForCourse,
  useCouponCodes,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useCourseCanRequestEligibility,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContentSuspense,
  useEnterpriseOffers,
  useSubscriptions,
} from '../../../app/data';
import { findEnterpriseOfferForCourse, getMissingApplicableSubsidyReason } from '../utils';
import useCourseListPrice from './useCourseListPrice';

/**
 * Given the state of a user's redeemable subsidy access policy and/or other subsidies, determine
 * which subsidy, if any, is applicable to the course.
 *
 * Note: The `canRedeem` query has a dynamic query key that may change on a background re-fetch of a
 * dependent query. Consumers of this hook may need to handle the `isPending` state.
 *
 * Returns:
 * {
 *  userSubsidyApplicableToCourse: null,
 *  missingUserSubsidyReason: null,
 *  isPending: false,
 * }
 *
 * @returns A subsidy that may be redeemed for the course.
 */
const useUserSubsidyApplicableToCourse = () => {
  const { courseKey } = useParams();
  const resolvedTransformedEnterpriseCustomerData = ({ transformed }) => ({
    fallbackAdminUsers: transformed.adminUsers.map(user => user.email),
    contactEmail: transformed.contactEmail,
  });
  const {
    data: {
      fallbackAdminUsers,
      contactEmail,
    },
  } = useEnterpriseCustomer({
    select: resolvedTransformedEnterpriseCustomerData,
  });
  const { data: courseListPrice } = useCourseListPrice();
  const {
    data: {
      customerAgreement,
      subscriptionLicense,
    },
  } = useSubscriptions();
  const {
    data: {
      containsContentItems,
      catalogList: catalogsWithCourse,
    },
  } = useEnterpriseCustomerContainsContentSuspense([courseKey]);
  const {
    data: {
      enterpriseOffers,
      currentEnterpriseOffers,
    },
  } = useEnterpriseOffers();
  const courseRedemptionEligibilityResult = useCourseRedemptionEligibility();
  const { isPending } = courseRedemptionEligibilityResult;
  const {
    isPolicyRedemptionEnabled = false,
    redeemableSubsidyAccessPolicy = null,
    availableCourseRuns: availableCourseRunsForLearnerCredit = [],
    missingSubsidyAccessPolicyReason = null,
  } = courseRedemptionEligibilityResult.data || {};
  const {
    data: {
      couponCodeAssignments,
      couponsOverview,
    },
  } = useCouponCodes();
  const { data: courseMetadata } = useCourseMetadata();

  /**
 * --- Fetch can_request state for Learner Credit ---
 * This is used to determine if the user can request Learner Credit for the course and returns:
 * { can_request, reason, requestable_subsidy_access_policy }
 */
  const { data: canRequestData, isPending: isCanRequestPending } = useCourseCanRequestEligibility();

  const isSubscriptionLicenseApplicable = determineSubscriptionLicenseApplicable(
    subscriptionLicense,
    catalogsWithCourse,
  );

  const userSubsidyApplicableToCourse = getSubsidyToApplyForCourse({
    applicableSubscriptionLicense: isSubscriptionLicenseApplicable ? subscriptionLicense : null,
    applicableSubsidyAccessPolicy: {
      isPolicyRedemptionEnabled,
      redeemableSubsidyAccessPolicy,
      availableCourseRuns: availableCourseRunsForLearnerCredit,
    },
    applicableCouponCode: findCouponCodeForCourse(couponCodeAssignments, catalogsWithCourse),
    applicableEnterpriseOffer: findEnterpriseOfferForCourse({
      enterpriseOffers: currentEnterpriseOffers,
      catalogsWithCourse,
      coursePrice: courseListPrice,
    }),
  });

  const missingUserSubsidyReason = useMemo(() => {
    if (userSubsidyApplicableToCourse) {
      return undefined;
    }
    const enterpriseAdminUsers = (
      missingSubsidyAccessPolicyReason?.metadata?.enterpriseAdministrators || fallbackAdminUsers
    );
    return getMissingApplicableSubsidyReason({
      enterpriseAdminUsers,
      contactEmail,
      catalogsWithCourse,
      couponCodes: couponCodeAssignments,
      couponsOverview,
      customerAgreement,
      subscriptionLicense,
      containsContentItems,
      missingSubsidyAccessPolicyReason,
      enterpriseOffers,
    });
  }, [
    userSubsidyApplicableToCourse,
    missingSubsidyAccessPolicyReason,
    fallbackAdminUsers,
    contactEmail,
    catalogsWithCourse,
    couponCodeAssignments,
    couponsOverview,
    customerAgreement,
    subscriptionLicense,
    containsContentItems,
    enterpriseOffers,
  ]);

  if (userSubsidyApplicableToCourse) {
    // Augment the selected subsidy object to backfill availableCourseRuns in case it isn't
    // supplied. Fallback to all unrestricted, available course runs.
    const onlyUnrestrictedCourseRuns = courseMetadata?.availableCourseRuns.filter(r => !r.restrictionType) || [];
    userSubsidyApplicableToCourse.availableCourseRuns = (
      userSubsidyApplicableToCourse?.availableCourseRuns || onlyUnrestrictedCourseRuns
    );
  }

  // --- Learner Credit B&R ---
  const canRequestLearnerCredit = !!canRequestData?.canRequest;
  const learnerCreditRequestablePolicy = canRequestData?.requestableSubsidyAccessPolicy || null;
  const learnerCreditRequestReason = canRequestData?.reason || null;

  return useMemo(() => ({
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
    isPending: isPending || isCanRequestPending || false,
    // Learner Credit B&R fields:
    canRequestLearnerCredit,
    learnerCreditRequestablePolicy,
    learnerCreditRequestReason,
  }), [
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
    isPending,
    isCanRequestPending,
    canRequestLearnerCredit,
    learnerCreditRequestablePolicy,
    learnerCreditRequestReason,
  ]);
};

export default useUserSubsidyApplicableToCourse;
