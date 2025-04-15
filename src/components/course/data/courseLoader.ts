import {
  generatePath, LoaderFunctionArgs, Params, redirect,
} from 'react-router-dom';

import {
  determineAllocatedAssignmentsForCourse,
  determineLearnerHasContentAssignmentsOnly,
  extractEnterpriseCustomer,
  getBaseSubscriptionsData,
  getCatalogsForSubsidyRequests,
  getLateEnrollmentBufferDays,
  getSearchCatalogs,
  queryBrowseAndRequestConfiguration,
  queryCanRedeem,
  queryCouponCodeRequests,
  queryCouponCodes,
  queryCourseMetadata,
  queryCourseRecommendations,
  queryCourseReviews,
  queryEnterpriseCourseEnrollments,
  queryEnterpriseCustomerContainsContent,
  queryEnterpriseLearnerOffers,
  queryLicenseRequests,
  queryRedeemablePolicies,
  querySubscriptions,
  queryUserEntitlements,
  safeEnsureQueryData,
  transformCourseMetadataByAllocatedCourseRunAssignments,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { getCourseTypeConfig, getLinkToCourse, pathContainsCourseTypeSlug } from './utils';
import { getErrorResponseStatusCode } from '../../../utils/common';

type CourseRouteParams<Key extends string = string> = Params<Key> & {
  readonly courseKey: string;
  readonly enterpriseSlug: string;
};
interface CourseLoaderFunctionArgs extends LoaderFunctionArgs {
  params: CourseRouteParams;
}
type CourseMetadata = {
  courseType: string;
};

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
    // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
    // need to replace it with `+` again to be a valid course run key.
    let courseRunKey = requestUrl.searchParams.get('course_run_key')?.replaceAll(' ', '+');

    const enterpriseCustomer = await extractEnterpriseCustomer({
      requestUrl,
      queryClient,
      authenticatedUser,
      enterpriseSlug,
    });
    if (!enterpriseCustomer) {
      return null;
    }
    const redeemableLearnerCreditPolicies = await safeEnsureQueryData({
      queryClient,
      query: queryRedeemablePolicies({
        enterpriseUuid: enterpriseCustomer.uuid,
        lmsUserId: authenticatedUser.userId,
      }),
      fallbackData: {
        redeemablePolicies: [],
        expiredPolicies: [],
        unexpiredPolicies: [],
        learnerContentAssignments: {
          assignments: [],
          hasAssignments: false,
          allocatedAssignments: [],
          hasAllocatedAssignments: false,
          acceptedAssignments: [],
          hasAcceptedAssignments: false,
          canceledAssignments: [],
          hasCanceledAssignments: false,
          expiredAssignments: [],
          hasExpiredAssignments: false,
          erroredAssignments: [],
          hasErroredAssignments: false,
          assignmentsForDisplay: [],
          hasAssignmentsForDisplay: false,
          reversedAssignments: [],
          hasReversedAssignments: false,
        },
      },
    });
    const otherSubsidyQueries = Promise.all([
      safeEnsureQueryData({
        queryClient,
        query: querySubscriptions(enterpriseCustomer.uuid),
        fallbackData: getBaseSubscriptionsData().baseSubscriptionsData,
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryEnterpriseLearnerOffers(enterpriseCustomer.uuid),
        fallbackData: {
          enterpriseOffers: [],
          currentEnterpriseOffers: [],
          canEnrollWithEnterpriseOffers: false,
          hasCurrentEnterpriseOffers: false,
          hasLowEnterpriseOffersBalance: false,
          hasNoEnterpriseOffersBalance: false,
        },
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryCouponCodes(enterpriseCustomer.uuid),
        fallbackData: {
          couponsOverview: [],
          couponCodeAssignments: [],
          couponCodeRedemptionCount: 0,
        },
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryLicenseRequests(enterpriseCustomer.uuid, authenticatedUser.email),
        fallbackData: [],
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryCouponCodeRequests(enterpriseCustomer.uuid, authenticatedUser.email),
        fallbackData: [],
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryBrowseAndRequestConfiguration(enterpriseCustomer.uuid),
        shouldLogError: (error) => getErrorResponseStatusCode(error) !== 404,
      }),
    ]);

    const {
      allocatedCourseRunAssignmentKeys,
      hasAssignedCourseRuns,
      hasMultipleAssignedCourseRuns,
    } = determineAllocatedAssignmentsForCourse({
      courseKey,
      redeemableLearnerCreditPolicies,
    });
    // only override `courseRunKey` when learner has a single allocated assignment
    if (!courseRunKey && hasAssignedCourseRuns) {
      courseRunKey = hasMultipleAssignedCourseRuns ? null : allocatedCourseRunAssignmentKeys[0];
    }
    await Promise.all([
      // Fetch course metadata, and then check if the user can redeem the course.
      // TODO: This should be refactored such that `can-redeem` can be called independently
      // of `course-metadata` to avoid an unnecessary request waterfall.
      queryClient.ensureQueryData<CourseMetadata | undefined>(queryCourseMetadata(courseKey, courseRunKey))
        .then(async (courseMetadata) => {
          if (!courseMetadata) {
            return null;
          }
          const lateEnrollmentBufferDays = getLateEnrollmentBufferDays(
            redeemableLearnerCreditPolicies.redeemablePolicies,
          );
          const transformedCourseMetadata = transformCourseMetadataByAllocatedCourseRunAssignments({
            hasMultipleAssignedCourseRuns,
            courseMetadata,
            allocatedCourseRunAssignmentKeys,
          });
          return safeEnsureQueryData({
            queryClient,
            query: queryCanRedeem(enterpriseCustomer.uuid, transformedCourseMetadata, lateEnrollmentBufferDays),
            shouldLogError: (error) => getErrorResponseStatusCode(error) !== 404,
            fallbackData: [],
          });
        }),
      safeEnsureQueryData({
        queryClient,
        query: queryEnterpriseCourseEnrollments(enterpriseCustomer.uuid),
        shouldLogError: (error) => getErrorResponseStatusCode(error) !== 404,
        fallbackData: [],
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryUserEntitlements(),
        fallbackData: [],
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryEnterpriseCustomerContainsContent(enterpriseCustomer.uuid, [courseKey]),
        fallbackData: {
          containsContentItems: false,
          catalogList: [],
        },
      }),
      safeEnsureQueryData({
        queryClient,
        query: queryCourseReviews(courseKey),
        shouldLogError: (error) => getErrorResponseStatusCode(error) !== 404,
        fallbackData: null,
      }),
      otherSubsidyQueries.then(async (subsidyResponses) => {
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
        return safeEnsureQueryData({
          queryClient,
          query: queryCourseRecommendations(
            enterpriseCustomer.uuid,
            courseKey,
            searchCatalogs,
          ),
          fallbackData: {
            allRecommendations: [],
            samePartnerRecommendations: [],
          },
        });
      }),
    ]);

    // If the course metadata (pre-fetched above) does not exist or is not available in
    // the enterprise's catalog(s), return with empty data.
    const courseMetadata = queryClient.getQueryData<CourseMetadata>(
      queryCourseMetadata(courseKey, courseRunKey).queryKey,
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
