import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  useLocation, useParams, useHistory,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';

import CourseService from './data/service';
import { LoadingSpinner } from '../loading-spinner';
import { CourseContextProvider } from './CourseContextProvider';
import {
  useAllCourseData,
  useExtractAndRemoveSearchParamsFromURL,
  useCheckSubsidyAccessPolicyRedeemability,
  useUserSubsidyApplicableToCourse,
  useCoursePriceForUserSubsidy,
} from './data/hooks';
import {
  getActiveCourseRun,
  getAvailableCourseRuns,
  linkToCourse,
  pathContainsCourseTypeSlug,
  getCourseTypeConfig,
  getEntitlementPrice,
  findHighestLevelEntitlementSku,
  getAvailableCourseRunKeysFromCourseData,
} from './data/utils';
import { canUserRequestSubsidyForCourse } from './enrollment/utils';
import NotFoundPage from '../NotFoundPage';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { useSearchCatalogs } from '../search/data/hooks';
import { useEnterpriseCuration } from '../search/content-highlights/data';
import CoursePageRoutes from './routes/CoursePageRoutes';

const CoursePage = () => {
  const { enterpriseSlug, courseKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const {
    uuid: enterpriseUUID,
    adminUsers: enterpriseAdminUsers,
  } = enterpriseConfig;
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    customerAgreementConfig,
  } = useContext(UserSubsidyContext);
  const {
    couponsForSubsidyRequests,
    catalogsForSubsidyRequests,
    subsidyRequestConfiguration,
  } = useContext(SubsidyRequestsContext);

  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseUUID);
  const { pathname, search } = useLocation();
  const history = useHistory();

  const courseRunKey = useMemo(
    () => {
      const queryParams = new URLSearchParams(search);
      return queryParams.get('course_run_key');
    },
    [search],
  );

  const activeCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  });

  // extract search queryId and objectId that led to this course page view from
  // the URL query parameters and then remove it to keep the URLs clean.
  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

  const courseService = useMemo(() => new CourseService({
    enterpriseUuid: enterpriseUUID,
    courseKey,
    courseRunKey,
  }), [courseKey, courseRunKey, enterpriseUUID]);

  const {
    courseData,
    courseRecommendations,
    fetchError: fetchCourseDataError,
    courseReviews,
    isLoadingCourseData,
  } = useAllCourseData({ courseService, activeCatalogs });
  const isEMETRedemptionEnabled = getConfig().FEATURE_ENABLE_EMET_REDEMPTION || hasFeatureFlagEnabled('ENABLE_EMET_REDEMPTION');

  const validCourseRunKeys = getAvailableCourseRunKeysFromCourseData(courseData);

  const {
    isInitialLoading: isLoadingAccessPolicyRedemptionStatus,
    data: subsidyAccessPolicyRedeemabilityData,
  } = useCheckSubsidyAccessPolicyRedeemability({
    enterpriseUuid: enterpriseUUID,
    courseRunKeys: validCourseRunKeys,
    activeCourseRunKey: courseService.activeCourseRun?.key,
    isQueryEnabled: isEMETRedemptionEnabled,
    queryOptions: {
      retry: (failureCount, err) => {
        // Retry max 3 times or if the error is 404 (not found)
        if (failureCount === 3 || err?.customAttributes?.httpErrorStatus === 404) {
          return false;
        }
        return true;
      },
    },
  });

  const {
    redeemableSubsidyAccessPolicy,
    redeemabilityPerContentKey,
    isPolicyRedemptionEnabled,
    missingSubsidyAccessPolicyReason,
    hasSuccessfulRedemption,
  } = subsidyAccessPolicyRedeemabilityData || {};

  const [validateLicenseForCourseError, setValidateLicenseForCourseError] = useState();
  const onSubscriptionLicenseForCourseValidationError = useCallback(
    (error) => setValidateLicenseForCourseError(error),
    [],
  );

  const isLoadingAny = (
    isLoadingCourseData || isLoadingAccessPolicyRedemptionStatus
  );
  const error = fetchCourseDataError || validateLicenseForCourseError;

  const courseState = useMemo(
    () => {
      // If we're still loading any data, or if we don't have any course data, we
      // don't have enough data to render the page so return undefined to keep rendering
      // a loading spinner.
      if (isLoadingAny || !courseData || !courseRecommendations) {
        return undefined;
      }
      const {
        courseDetails,
        userEnrollments,
        userEntitlements,
        catalog,
      } = courseData;
      const { allRecommendations, samePartnerRecommendations } = courseRecommendations;
      const courseEntitlementProductSku = findHighestLevelEntitlementSku(courseDetails.entitlements);
      return {
        course: courseDetails,
        activeCourseRun: getActiveCourseRun(courseDetails),
        availableCourseRuns: getAvailableCourseRuns(courseDetails),
        userEnrollments,
        userEntitlements,
        catalog,
        courseReviews,
        algoliaSearchParams,
        courseRecommendations: {
          allRecommendations: allRecommendations?.slice(0, 3),
          samePartnerRecommendations: samePartnerRecommendations?.slice(0, 3),
        },
        courseEntitlementProductSku,
      };
    },
    [
      isLoadingAny,
      courseData,
      courseRecommendations,
      courseReviews,
      algoliaSearchParams,
    ],
  );

  const courseListPrice = subsidyAccessPolicyRedeemabilityData?.coursePrice
  || courseState?.activeCourseRun?.firstEnrollablePaidSeatPrice
  || getEntitlementPrice(courseState?.course?.entitlements);

  const {
    userSubsidyApplicableToCourse,
    missingUserSubsidyReason,
  } = useUserSubsidyApplicableToCourse({
    courseData,
    redeemableSubsidyAccessPolicy,
    isPolicyRedemptionEnabled,
    subscriptionLicense,
    courseService,
    couponCodes,
    couponsForSubsidyRequests,
    canEnrollWithEnterpriseOffers,
    enterpriseOffers,
    onSubscriptionLicenseForCourseValidationError,
    missingSubsidyAccessPolicyReason,
    enterpriseAdminUsers,
    courseListPrice,
    customerAgreementConfig,
  });

  const [coursePrice, currency] = useCoursePriceForUserSubsidy({
    userSubsidyApplicableToCourse,
    listPrice: courseListPrice,
  });

  useEffect(() => {
    // Redirect if path does not contain course type
    if (
      courseState?.course?.courseType
      && getCourseTypeConfig(courseState.course)
      && !pathContainsCourseTypeSlug(
        pathname,
        courseState.course.courseType,
      )
    ) {
      const newUrl = linkToCourse(
        courseState.course,
        enterpriseSlug,
      );
      history.replace(newUrl);
    }
  }, [enterpriseSlug, history, courseState, pathname]);

  const subsidyRequestCatalogsApplicableToCourse = useMemo(() => {
    const catalogsContainingCourse = new Set(courseState?.catalog?.catalogList);
    const subsidyRequestCatalogIntersection = new Set(
      catalogsForSubsidyRequests.filter(el => catalogsContainingCourse.has(el)),
    );
    return subsidyRequestCatalogIntersection;
  }, [courseState?.catalog?.catalogList, catalogsForSubsidyRequests]);

  const userCanRequestSubsidyForCourse = canUserRequestSubsidyForCourse({
    subsidyRequestConfiguration,
    subsidyRequestCatalogsApplicableToCourse,
    userSubsidyApplicableToCourse,
    couponsForSubsidyRequests,
  });

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  if (!courseState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading course" />
      </Container>
    );
  }
  // If there isn't an active course run we don't show the course at all
  if (!courseState.activeCourseRun) {
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${courseState.course.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <CourseEnrollmentsContextProvider>
        <CourseContextProvider
          courseState={courseState}
          missingUserSubsidyReason={missingUserSubsidyReason}
          userSubsidyApplicableToCourse={userSubsidyApplicableToCourse}
          isPolicyRedemptionEnabled={isPolicyRedemptionEnabled}
          redeemabilityPerContentKey={redeemabilityPerContentKey}
          userCanRequestSubsidyForCourse={userCanRequestSubsidyForCourse}
          subsidyRequestCatalogsApplicableToCourse={subsidyRequestCatalogsApplicableToCourse}
          coursePrice={coursePrice}
          currency={currency}
          canOnlyViewHighlightSets={canOnlyViewHighlightSets}
          hasSuccessfulRedemption={hasSuccessfulRedemption}
        >
          <CoursePageRoutes />
        </CourseContextProvider>
      </CourseEnrollmentsContextProvider>
    </>
  );
};

export default CoursePage;
