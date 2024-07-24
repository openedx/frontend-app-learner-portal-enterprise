import { generatePath, redirect } from 'react-router-dom';

import {
  queryUserEntitlements,
  queryCanRedeem,
  queryCourseMetadata,
  queryEnterpriseCourseEnrollments,
  extractEnterpriseCustomer,
  queryRedeemablePolicies,
  getLateEnrollmentBufferDays,
  querySubscriptions,
  queryLicenseRequests,
  queryCouponCodeRequests,
  determineLearnerHasContentAssignmentsOnly,
  queryEnterpriseLearnerOffers,
  queryCouponCodes,
  queryCourseReviews,
  queryEnterpriseCustomerContainsContent,
  queryCourseRecommendations,
  getSearchCatalogs,
  getCatalogsForSubsidyRequests,
  queryBrowseAndRequestConfiguration,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  getCourseTypeConfig,
  getLinkToCourse,
  pathContainsCourseTypeSlug,
} from './utils';

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

    const enterpriseCustomer = await extractEnterpriseCustomer({
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    const subsidyQueries = Promise.all([
      queryClient.ensureQueryData(queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: authenticatedUser.userId,
      })),
      queryClient.ensureQueryData(querySubscriptions(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryEnterpriseLearnerOffers(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryCouponCodes(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryLicenseRequests(enterpriseCustomer.uuid, authenticatedUser.email)),
      queryClient.ensureQueryData(queryCouponCodeRequests(enterpriseCustomer.uuid, authenticatedUser.email)),
      queryClient.ensureQueryData(queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid)),
    ]);

    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      queryClient.ensureQueryData(queryCourseMetadata(courseKey, courseRunKey)).then(async (courseMetadata) => {
        if (!courseMetadata) {
          return null;
        }
        const redeemableLearnerCreditPolicies = await queryClient.ensureQueryData(queryRedeemablePolicies({
          enterpriseUuid: enterpriseCustomer.uuid,
          lmsUserId: authenticatedUser.userId,
        }));
        const lateEnrollmentBufferDays = getLateEnrollmentBufferDays(
          redeemableLearnerCreditPolicies.redeemablePolicies,
        );
        return queryClient.ensureQueryData(
          queryCanRedeem(enterpriseCustomer.uuid, courseMetadata, lateEnrollmentBufferDays),
        );
      }),
      queryClient.ensureQueryData(queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid)),
      queryClient.ensureQueryData(queryUserEntitlements()),
      queryClient.ensureQueryData(queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, [courseKey])),
      queryClient.ensureQueryData(queryCourseReviews(courseKey)),
      subsidyQueries.then(async (subsidyResponses) => {
        const redeemableLearnerCreditPolicies = subsidyResponses[0];
        const { customerAgreement, subscriptionPlan, subscriptionLicense } = subsidyResponses[1];
        const { hasCurrentEnterpriseOffers, currentEnterpriseOffers } = subsidyResponses[2];
        const {
          couponCodeAssignments,
          couponCodeRedemptionCount,
          couponsOverview,
        } = subsidyResponses[3];
        const licenseRequests = subsidyResponses[4];
        const couponCodeRequests = subsidyResponses[5];
        const browseAndRequestConfiguration = subsidyResponses[6];
        const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
          subscriptionPlan,
          subscriptionLicense,
          licenseRequests,
          couponCodeRequests,
          couponCodesCount: couponCodeRedemptionCount,
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

        // Determine which catalogs are available for the user/enterprise to filter course recommendations.
        const searchCatalogs = getSearchCatalogs({
          redeemablePolicies: redeemableLearnerCreditPolicies.redeemablePolicies,
          catalogsForSubsidyRequests: getCatalogsForSubsidyRequests({
            browseAndRequestConfiguration,
            couponsOverview,
            customerAgreement,
          }),
          couponCodeAssignments,
          currentEnterpriseOffers,
          subscriptionLicense,
        });
        return queryClient.ensureQueryData(queryCourseRecommendations(
          enterpriseCustomer.uuid,
          courseKey,
          searchCatalogs,
        ));
      }),
    ]);

    // If the course metadata (pre-fetched above) does not exist or is not available in
    // the enterprise's catalog(s), return with empty data.
    const courseMetadata = queryClient.getQueryData(queryCourseMetadata(courseKey, courseRunKey));
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

    return null;
  };
}
