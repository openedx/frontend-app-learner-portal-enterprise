import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { CourseContext } from './CourseContextProvider';
import {
  useExtractAndRemoveSearchParamsFromURL,
} from './data/hooks';
import NotFoundPage from '../NotFoundPage';
import {
  useCourseMetadata,
  useEnterpriseCustomer,
} from '../app/data';

const CoursePage = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();

  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

  const contextValue = useMemo(() => ({
    algoliaSearchParams,
  }), [algoliaSearchParams]);

  // If there isn't an active course run we don't show the course at all
  if (!courseMetadata?.activeCourseRun) {
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${courseMetadata.title} - ${enterpriseCustomer.name}`;

  return (
    <CourseContext.Provider value={contextValue}>
      <Helmet title={PAGE_TITLE} />
      <Outlet />
    </CourseContext.Provider>
  );

  // const { search } = useLocation();
  // const { enterpriseSlug, courseKey } = useParams();

  // const { data: subscriptions } = useSubscriptions();
  // subscriptions.subscriptionPlan
  // subscriptions.subscriptionLicense
  // subscriptions.customerAgreement

  // const { data: enterpriseOffersData } = useEnterpriseOffers();
  // enterpriseOffers.canEnrollWithEnterpriseOffers
  // enterpriseOffers.enterpriseOffers

  // const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  // redeemableLearnerCreditPolicies.redeemablePolicies
  // redeemableLearnerCreditPolicies.learnerContentAssignments

  // const { data: couponCodes } = useCouponCodes();
  // couponCodes.couponCodeAssignments
  // couponCodes.couponsOverview

  // const { data: browseAndRequest } = useBrowseAndRequest();
  // browseAndRequest.configuration
  // const catalogsForSubsidyRequests = useCatalogsForSubsidyRequests();
  // const { data: canOnlyViewHighlightSets } = useCanOnlyViewHighlights();
  // const searchCatalogs = useSearchCatalogs();
  // const isEnrollableBufferDays = useLateRedemptionBufferDays();
  // const { data: enterpriseCustomerContainsContent } = useEnterpriseCustomerContainsContent();

  // const { data: subsidyAccessPolicyRedeemabilityData } = useCourseRedemptionEligibility();
  // const {
  //   redeemableSubsidyAccessPolicy,
  //   redeemabilityPerContentKey,
  //   isPolicyRedemptionEnabled,
  //   missingSubsidyAccessPolicyReason,
  //   hasSuccessfulRedemption,
  // } = subsidyAccessPolicyRedeemabilityData || {};

  // extract search queryId and objectId that led to this course page view from
  // the URL query parameters and then remove it to keep the URLs clean.

  // const { data: enterpriseCourseEnrollments } = useEnterpriseCourseEnrollments();
  // console.log('enterpriseCourseEnrollments', enterpriseCourseEnrollments);

  // const { data: userEntitlements } = useUserEntitlements();
  // console.log('userEntitlements', userEntitlements);

  // const validCourseRunKeys = getAvailableCourseRunKeysFromCourseData({
  //   courseData: { courseDetails: courseMetadata },
  //   isEnrollableBufferDays,
  // });
  // console.log('validCourseRunKeys', validCourseRunKeys);

  // const { pathname, state } = useLocation();
  // const navigate = useNavigate();

  // const courseService = useMemo(() => new CourseService({
  //   enterpriseUuid: enterpriseUUID,
  //   courseKey,
  //   courseRunKey,
  //   isEnrollableBufferDays,
  // }), [courseKey, courseRunKey, enterpriseUUID, isEnrollableBufferDays]);

  // const {
  //   courseData,
  //   courseRecommendations,
  //   fetchError: fetchCourseDataError,
  //   courseReviews,
  //   isLoading: isLoadingCourseData,
  // } = useAllCourseData({ courseService, activeCatalogs });

  // const courseState = useMemo(
  //   () => {
  //     const { allRecommendations, samePartnerRecommendations } = courseRecommendations;
  //     const courseEntitlementProductSku = findHighestLevelEntitlementSku(courseDetails.entitlements);
  //     return {
  //       course: courseDetails,
  //       availableCourseRuns: getAvailableCourseRuns({ course: courseDetails, isEnrollableBufferDays }),
  //       userEnrollments,
  //       userEntitlements,
  //       catalog,
  //       courseReviews,
  //       algoliaSearchParams,
  //       courseRecommendations: {
  //         allRecommendations: allRecommendations?.slice(0, 3),
  //         samePartnerRecommendations: samePartnerRecommendations?.slice(0, 3),
  //       },
  //       courseEntitlementProductSku,
  //     };
  //   },
  //   [
  //     isLoadingAny,
  //     courseData,
  //     courseRecommendations,
  //     courseReviews,
  //     algoliaSearchParams,
  //     isEnrollableBufferDays,
  //   ],
  // );
};

export default CoursePage;
