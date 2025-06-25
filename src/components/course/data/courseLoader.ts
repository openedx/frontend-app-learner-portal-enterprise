import {
  generatePath, LoaderFunctionArgs, Params, redirect,
} from 'react-router-dom';

import {
  determineAllocatedAssignmentsForCourse,
  determineLearnerHasContentAssignmentsOnly,
  determineSubscriptionLicenseApplicable,
  extractCourseRunKeyFromSearchParams,
  extractEnterpriseCustomer,
  findCouponCodeForCourse,
  getCatalogsForSubsidyRequests,
  getCourseRunsForRedemption,
  getLateEnrollmentBufferDays,
  getSearchCatalogs,
  queryCourseMetadata,
  safeEnsureQueryDataBrowseAndRequestConfiguration,
  safeEnsureQueryDataCanRedeem,
  safeEnsureQueryDataCanRequest,
  safeEnsureQueryDataCouponCodeRequests,
  safeEnsureQueryDataCouponCodes,
  safeEnsureQueryDataCourseRecommendations,
  safeEnsureQueryDataCourseReviews,
  safeEnsureQueryDataCustomerContainsContent,
  safeEnsureQueryDataEnterpriseCourseEnrollments,
  safeEnsureQueryDataEnterpriseOffers,
  safeEnsureQueryDataLicenseRequests,
  safeEnsureQueryDataRedeemablePolicies,
  safeEnsureQueryDataSubscriptions,
  safeEnsureQueryDataUserEntitlements,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  getCourseTypeConfig, getLinkToCourse, pathContainsCourseTypeSlug,
} from './utils';

type CourseRouteParams<Key extends string = string> = Params<Key> & {
  readonly courseKey: string;
  readonly enterpriseSlug: string;
};
interface CourseLoaderFunctionArgs extends LoaderFunctionArgs {
  params: CourseRouteParams;
}

/**
 * Course loader for the course related page routes.
 */
const makeCourseLoader: MakeRouteLoaderFunctionWithQueryClient = function makeCourseLoader(queryClient) {
  return async function courseLoader({ params, request }: CourseLoaderFunctionArgs) {
    const requestUrl = new URL(request.url);
    const authenticatedUser = await ensureAuthenticatedUser(requestUrl, params);
    // User is not authenticated, so we can't do anything in this loader.
    if (!authenticatedUser) {
      return null;
    }

    const { courseKey, enterpriseSlug } = params;
    const courseRunKey = extractCourseRunKeyFromSearchParams(requestUrl.searchParams);

    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }

    const prerequisiteQueries = await Promise.all([
      safeEnsureQueryDataCustomerContainsContent({
        queryClient,
        enterpriseCustomer,
        courseKey,
      }),
      safeEnsureQueryDataCouponCodes({
        queryClient,
        enterpriseCustomer,
      }),
      safeEnsureQueryDataSubscriptions({
        queryClient,
        enterpriseCustomer,
      }),
      safeEnsureQueryDataRedeemablePolicies({
        queryClient,
        enterpriseCustomer,
        authenticatedUser,
      }),
    ]);
    const [
      { catalogList: catalogsWithCourse },
      { couponsOverview, couponCodeAssignments, couponCodeRedemptionCount },
      { customerAgreement, subscriptionLicense, subscriptionPlan },
      redeemableLearnerCreditPolicies,
    ] = prerequisiteQueries;

    const otherSubsidyQueries = Promise.all([
      safeEnsureQueryDataEnterpriseOffers({
        queryClient,
        enterpriseCustomer,
      }),
      safeEnsureQueryDataLicenseRequests({
        queryClient,
        enterpriseCustomer,
        authenticatedUser,
      }),
      safeEnsureQueryDataCouponCodeRequests({
        queryClient,
        enterpriseCustomer,
        authenticatedUser,
      }),
      safeEnsureQueryDataBrowseAndRequestConfiguration({
        queryClient,
        enterpriseCustomer,
      }),
      safeEnsureQueryDataCanRequest({
        queryClient,
        enterpriseCustomer,
        courseKey,
      }),
    ]);

    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      queryClient.ensureQueryData(queryCourseMetadata(courseKey))
        .then(async (courseMetadata) => {
          if (!courseMetadata) {
            return null;
          }
          const lateEnrollmentBufferDays = getLateEnrollmentBufferDays(
            redeemableLearnerCreditPolicies.redeemablePolicies,
          );
          const isSubscriptionLicenseApplicable = determineSubscriptionLicenseApplicable(
            subscriptionLicense,
            catalogsWithCourse,
          );
          const applicableCouponCode = findCouponCodeForCourse(couponCodeAssignments, catalogsWithCourse);
          const hasSubsidyPrioritizedOverLearnerCredit = isSubscriptionLicenseApplicable
            || applicableCouponCode?.couponCodeRedemptionCount > 0;
          const { courseRunKeys: courseRunKeysForRedemption } = getCourseRunsForRedemption({
            course: courseMetadata,
            lateEnrollmentBufferDays,
            courseRunKey,
            redeemableLearnerCreditPolicies,
            hasSubsidyPrioritizedOverLearnerCredit,
          });
          return safeEnsureQueryDataCanRedeem({
            queryClient,
            enterpriseCustomer,
            courseMetadata,
            courseRunKeysForRedemption,
          });
        }),
      safeEnsureQueryDataEnterpriseCourseEnrollments({
        queryClient,
        enterpriseCustomer,
      }),
      safeEnsureQueryDataUserEntitlements({
        queryClient,
      }),
      safeEnsureQueryDataCourseReviews({
        queryClient,
        courseKey,
      }),
      otherSubsidyQueries.then(async (subsidyResponses) => {
        const { hasCurrentEnterpriseOffers, currentEnterpriseOffers } = subsidyResponses[0];
        const licenseRequests = subsidyResponses[1];
        const couponCodeRequests = subsidyResponses[2];
        const browseAndRequestConfiguration = subsidyResponses[3];
        const isAssignmentOnlyLearner = determineLearnerHasContentAssignmentsOnly({
          subscriptionPlan,
          subscriptionLicense,
          licenseRequests,
          couponCodeRequests,
          couponCodesCount: couponCodeRedemptionCount,
          redeemableLearnerCreditPolicies,
          hasCurrentEnterpriseOffers,
        });
        const { isCourseAssigned } = determineAllocatedAssignmentsForCourse({
          courseKey,
          redeemableLearnerCreditPolicies,
        });
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
        return safeEnsureQueryDataCourseRecommendations({
          queryClient,
          enterpriseCustomer,
          courseKey,
          searchCatalogs,
        });
      }),
    ]);

    // If the course metadata (pre-fetched above) does not exist or is not available in
    // the enterprise's catalog(s), return with empty data.
    const courseMetadata = queryClient.getQueryData<CourseMetadata>(
      queryCourseMetadata(courseKey).queryKey,
    );
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
};

export default makeCourseLoader;
