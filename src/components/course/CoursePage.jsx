import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  useLocation, useParams, useNavigate, Outlet,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container } from '@openedx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import { CourseContext, CourseContextProvider } from './CourseContextProvider';
import {
  useAllCourseData,
  useExtractAndRemoveSearchParamsFromURL,
  useUserSubsidyApplicableToCourse,
  useCoursePriceForUserSubsidy,
} from './data/hooks';
import {
  getActiveCourseRun,
  getAvailableCourseRuns,
  getLinkToCourse,
  pathContainsCourseTypeSlug,
  getCourseTypeConfig,
  getEntitlementPrice,
  findHighestLevelEntitlementSku,
  getAvailableCourseRunKeysFromCourseData,
} from './data/utils';
import { canUserRequestSubsidyForCourse } from './enrollment/utils';
import NotFoundPage from '../NotFoundPage';
import CoursePageRoutes from './routes/CoursePageRoutes';
import {
  useBrowseAndRequest,
  useCanOnlyViewHighlights,
  useCouponCodes,
  useCourseMetadata,
  useEnterpriseCustomerContainsContent,
  useCourseRedemptionEligibility,
  useEnterpriseCourseEnrollments,
  useEnterpriseCustomer,
  useEnterpriseOffers,
  useLateRedemptionBufferDays,
  useRedeemablePolicies,
  useSubscriptions,
  useUserEntitlements,
} from '../app/data';
import { useCatalogsForSubsidyRequests } from '../hooks';
import { useSearchCatalogs } from '../search';

const CoursePage = () => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();

  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

  const {
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  } = useUserSubsidyApplicableToCourse();
  console.log('useUserSubsidyApplicableToCourse', {
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  });

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

  // const courseRunKey = useMemo(
  //   () => {
  //     const queryParams = new URLSearchParams(search);
  //     return queryParams.get('course_run_key');
  //   },
  //   [search],
  // );

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

  // const [validateLicenseForCourseError, setValidateLicenseForCourseError] = useState();
  // const onSubscriptionLicenseForCourseValidationError = useCallback(
  //   (error) => setValidateLicenseForCourseError(error),
  //   [],
  // );

  // const isLoadingAny = (
  //   isLoadingCourseData || isLoadingAccessPolicyRedemptionStatus
  // );
  // const error = fetchCourseDataError || validateLicenseForCourseError;

  // const courseState = useMemo(
  //   () => {
  //     // If we're still loading any data, or if we don't have any course data, we
  //     // don't have enough data to render the page so return undefined to keep rendering
  //     // a loading spinner.
  //     // if (isLoadingAny || !courseData || !courseRecommendations) {
  //     //   return undefined;
  //     // }
  //     const {
  //       // courseDetails,
  //       // userEnrollments,
  //       // userEntitlements,
  //       // catalog,
  //     } = courseData;
  //     const { allRecommendations, samePartnerRecommendations } = courseRecommendations;
  //     const courseEntitlementProductSku = findHighestLevelEntitlementSku(courseDetails.entitlements);
  //     return {
  //       course: courseDetails,
  //       activeCourseRun: getActiveCourseRun(courseDetails),
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

  // const courseListPrice = subsidyAccessPolicyRedeemabilityData?.listPrice
  // || courseState?.activeCourseRun?.firstEnrollablePaidSeatPrice
  // || getEntitlementPrice(courseState?.course?.entitlements);

  // const [coursePrice, currency] = useCoursePriceForUserSubsidy({
  //   userSubsidyApplicableToCourse,
  //   listPrice: courseListPrice,
  // });

  // const subsidyRequestCatalogsApplicableToCourse = useMemo(() => {
  //   const catalogsContainingCourse = new Set(courseState?.catalog?.catalogList);
  //   const subsidyRequestCatalogIntersection = new Set(
  //     catalogsForSubsidyRequests.filter(el => catalogsContainingCourse.has(el)),
  //   );
  //   return subsidyRequestCatalogIntersection;
  // }, [courseState?.catalog?.catalogList, catalogsForSubsidyRequests]);

  // const userCanRequestSubsidyForCourse = canUserRequestSubsidyForCourse({
  //   subsidyRequestConfiguration,
  //   subsidyRequestCatalogsApplicableToCourse,
  //   userSubsidyApplicableToCourse,
  // });

  // return (
  //   <>
  //     <Helmet title={PAGE_TITLE} />
  //     <CourseEnrollmentsContextProvider>
  //       <CourseContextProvider
  //         courseState={courseState}
  //         missingUserSubsidyReason={missingUserSubsidyReason}
  //         userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
  //         isPolicyRedemptionEnabled={isPolicyRedemptionEnabled}
  //         redeemabilityPerContentKey={redeemabilityPerContentKey}
  //         userCanRequestSubsidyForCourse={userCanRequestSubsidyForCourse}
  //         subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
  //         coursePrice={coursePrice}
  //         currency={currency}
  //         canOnlyViewHighlightSets={canOnlyViewHighlightSets}
  //         hasSuccessfulRedemption={hasSuccessfulRedemption}
  //       >
  //         <CoursePageRoutes />
  //       </CourseContextProvider>
  //     </CourseEnrollmentsContextProvider>
  //   </>
  // );
};

export default CoursePage;
