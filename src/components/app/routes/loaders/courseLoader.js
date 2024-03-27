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
    // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
    // need to replace it with `+` again to be a valid course run key.
    const courseRunKey = requestUrl.searchParams.get('course_run_key')?.replaceAll(' ', '+');

    const enterpriseId = await extractEnterpriseId({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });

    const subsidiesQueries = Promise.all([
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
      subsidiesQueries.then(async (responses) => {
        const redeemableLearnerCreditPolicies = responses[0];
        const { subscriptionPlan, subscriptionLicense } = responses[1];
        const { hasCurrentEnterpriseOffers } = responses[2];
        const { couponCodeAssignments } = responses[3];
        const licenseRequests = responses[4];
        const couponCodeRequests = responses[5];

        const isEnrollableBufferDays = getLateRedemptionBufferDays(redeemableLearnerCreditPolicies.redeemablePolicies);
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
        const courseData = await Promise.all([
          queryClient.ensureQueryData(queryCourseMetadata(
            enterpriseId,
            courseKey,
            courseRunKey,
            isEnrollableBufferDays,
          )),
          queryClient.ensureQueryData(queryCourseReviews(enterpriseId, courseKey)),
        ]);
        const courseMetadata = courseData[0];

        // If the course does not exist or is not available in the enterprise catalog(s),
        // return with empty data.
        if (!courseMetadata) {
          return null;
        }

        // Check whether user should be redirected to appropriate course route
        // based on the course type. I.e., if the configuration for the course type
        // is available and the current route does not contain the course type slug,
        // redirect to the appropriate course route.
        if (
          courseMetadata.courseType
          && getCourseTypeConfig(courseMetadata)
          && !pathContainsCourseTypeSlug(requestUrl.pathname, courseMetadata.courseType)
        ) {
          const newUrl = getLinkToCourse(courseMetadata, enterpriseSlug);
          throw redirect(newUrl);
        }

        // return queryClient.ensureQueryData(queryCourseReviews(enterpriseId, courseKey)),

        // Otherwise, the course metadata is available in the enterprise catalog(s), so
        // we can proceed to check if the user can redeem the course.
        return queryClient.ensureQueryData(queryCanRedeem(enterpriseId, courseMetadata, isEnrollableBufferDays));
      }),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseId)),
      queryClient.ensureQueryData(queryUserEntitlements()),
      queryClient.ensureQueryData(queryEnterpriseCustomerContainsContent(enterpriseId, [courseKey])),
    ]);

    return null;
  };
}
