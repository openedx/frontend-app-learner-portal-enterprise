import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  useLocation, useParams, useHistory,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';

import CourseService from './data/service';
import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { CourseContextProvider } from './CourseContextProvider';
import CourseHeader from './course-header/CourseHeader';
import CourseMainContent from './CourseMainContent';
import CourseSidebar from './CourseSidebar';

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
} from './data/utils';
import { canUserRequestSubsidyForCourse } from './enrollment/utils';

import NotFoundPage from '../NotFoundPage';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import CourseRecommendations from './CourseRecommendations';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { useSearchCatalogs } from '../search/data/hooks';
import { useEnterpriseCuration } from '../search/content-highlights/data';

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
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests, subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);

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
  const {
    isInitialLoading: isLoadingAccessPolicyRedemptionStatus,
    data: subsidyAccessPolicyRedeemabilityData,
  } = useCheckSubsidyAccessPolicyRedeemability({
    enterpriseUuid: enterpriseUUID,
    courseRunKeys: courseData?.courseDetails.courseRunKeys || [],
    activeCourseRunKey: courseService.activeCourseRun?.key,
    isQueryEnabled: isEMETRedemptionEnabled,
  });
  const {
    redeemableSubsidyAccessPolicy,
    redeemabilityPerContentKey,
    isPolicyRedemptionEnabled,
    missingSubsidyAccessPolicyReason,
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
    canEnrollWithEnterpriseOffers,
    enterpriseOffers,
    onSubscriptionLicenseForCourseValidationError,
    missingSubsidyAccessPolicyReason,
    enterpriseAdminUsers,
    courseListPrice: (
      courseState?.activeCourseRun?.firstEnrollablePaidSeatPrice
      || getEntitlementPrice(courseState?.course?.entitlements)
    ),
  });

  const [coursePrice, currency] = useCoursePriceForUserSubsidy({
    courseEntitlements: courseState?.course?.entitlements,
    activeCourseRun: courseState?.activeCourseRun,
    userSubsidyApplicableToCourse,
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
        >
          <CourseHeader />
          <Container size="lg" className="py-5">
            <Row>
              <MainContent>
                <CourseMainContent />
              </MainContent>
              <MediaQuery minWidth={breakpoints.large.minWidth}>
                {matches => matches && (
                  <Sidebar>
                    <CourseSidebar />
                  </Sidebar>
                )}
              </MediaQuery>
              {canOnlyViewHighlightSets === false && <CourseRecommendations />}
            </Row>
          </Container>
        </CourseContextProvider>
      </CourseEnrollmentsContextProvider>
    </>
  );
};

export default CoursePage;
