import { generatePath, redirect } from 'react-router-dom';

import {
  queryUserEntitlements,
  queryCanRedeem,
  queryCourseMetadata,
  queryEnterpriseCourseEnrollments,
  extractEnterpriseId,
  queryRedeemablePolicies,
  getLateRedemptionBufferDays,
  querySubscriptions,
  queryLicenseRequests,
  queryCouponCodeRequests,
  determineLearnerHasContentAssignmentsOnly,
  queryEnterpriseLearnerOffers,
  queryCouponCodes,
  queryCourseReviews,
  queryEnterpriseCustomerContainsContent,
} from '../../data';
import { ensureAuthenticatedUser } from '../data';
import { getCourseTypeConfig, getLinkToCourse, pathContainsCourseTypeSlug } from '../../../course/data';

/**
 * Course loader for the course related page routes.
 * @param {Object} queryClient - The query client.
 * @returns {Function} - A loader function.
 */
export default function makeCourseLoader(queryClient) {
  return async function courseLoader({ params = {}, request }) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { courseKey, enterpriseSlug } = params;

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const courseMetadataAndSubsidies = Promise.all([
      queryClient.ensureQueryData(queryCourseMetadata(enterpriseId, courseKey)),
      queryClient.ensureQueryData(queryCourseReviews(enterpriseId, courseKey)),
      queryClient.ensureQueryData(queryRedeemablePolicies({
        enterpriseUuid: enterpriseId,
        lmsUserId: authenticatedUser.userId,
      })),
      queryClient.ensureQueryData(querySubscriptions(enterpriseId)),
      queryClient.ensureQueryData(queryEnterpriseLearnerOffers(enterpriseId)),
      queryClient.ensureQueryData(queryCouponCodes(enterpriseId)),
      queryClient.ensureQueryData(queryLicenseRequests(enterpriseId, authenticatedUser.email)),
      queryClient.ensureQueryData(queryCouponCodeRequests(enterpriseId, authenticatedUser.email)),
    ]);

    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      courseMetadataAndSubsidies.then((responses) => {
        const courseMetadata = responses[0];
        const redeemableLearnerCreditPolicies = responses[2];
        const { subscriptionPlan, subscriptionLicense } = responses[3];
        const { hasCurrentEnterpriseOffers } = responses[4];
        const { couponCodeAssignments } = responses[5];
        const licenseRequests = responses[6];
        const couponCodeRequests = responses[7];

        const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
          subscriptionPlan,
          subscriptionLicense,
          licenseRequests,
          couponCodeRequests,
          couponCodesCount: couponCodeAssignments.length,
          redeemableLearnerCreditPolicies,
          hasCurrentEnterpriseOffers,
        });
        const isCourseAssigned = redeemableLearnerCreditPolicies.learnerContentAssignments.allocatedAssignments.some(
          (assignment) => assignment.contentKey === courseKey,
        );

        // If learner is an assignment-only learner and is not assigned to the currently
        // viewed course, redirect to the Dashboard page route.
        if (isAssignmentOnlyLearner && !isCourseAssigned) {
          throw redirect(generatePath('/:enterpriseSlug', { enterpriseSlug }));
        }

        // If the course does not exist or is not available in the enterprise catalog(s),
        // return with empty data.
        if (!courseMetadata) {
          return null;
        }

        // TODO
        if (
          courseMetadata.courseType
          && getCourseTypeConfig(courseMetadata)
          && !pathContainsCourseTypeSlug(requestUrl.pathname, courseMetadata.courseType)
        ) {
          const newUrl = getLinkToCourse(courseMetadata, enterpriseSlug);
          throw redirect(newUrl);
        }

        // Otherwise, the course metadata is available in the enterprise catalog(s), so
        // we can proceed to check if the user can redeem the course.
        const isEnrollableBufferDays = getLateRedemptionBufferDays(redeemableLearnerCreditPolicies.redeemablePolicies);
        return queryClient.ensureQueryData(queryCanRedeem(enterpriseId, courseMetadata, isEnrollableBufferDays));
      }),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId)),
      queryClient.ensureQueryData(queryUserEntitlements()),
      queryClient.ensureQueryData(queryEnterpriseCustomerContainsContent(enterpriseId, courseKey)),
    ]);

    return null;
  };
}
