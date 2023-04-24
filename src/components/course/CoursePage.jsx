import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

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
  useCheckAccessPolicyRedemptionEligibility,
  useUserSubsidyApplicableToCourse,
} from './data/hooks';
import { getActiveCourseRun, getAvailableCourseRuns, checkPolicyRedemptionEnabled } from './data/utils';
import NotFoundPage from '../NotFoundPage';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import CourseRecommendations from './CourseRecommendations';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import { useSearchCatalogs } from '../search/data/hooks';
import { useEnterpriseCuration } from '../search/content-highlights/data';

const CoursePage = () => {
  const { search } = useLocation();
  const { courseKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
  } = useContext(UserSubsidyContext);
  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseUUID);

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
    enterpriseUuid: enterpriseConfig?.uuid,
    courseKey,
    courseRunKey,
  }), [courseKey, courseRunKey, enterpriseConfig?.uuid]);

  const {
    courseData,
    courseRecommendations,
    fetchError: fetchCourseDataError,
    isLoadingCourseData,
  } = useAllCourseData({
    courseService,
    subscriptionLicense,
    couponCodes,
    canEnrollWithEnterpriseOffers,
    enterpriseOffers,
    activeCatalogs,
  });

  const {
    isInitialLoading: isLoadingAccessPolicyRedemptionStatus,
    data: accessPolicyRedemptionEligibilityData,
  } = useCheckAccessPolicyRedemptionEligibility({
    enterpriseUuid: enterpriseUUID,
    courseRunKeys: courseData?.courseDetails.courseRunKeys || [],
  });
  const isPolicyRedemptionEnabled = checkPolicyRedemptionEnabled({ accessPolicyRedemptionEligibilityData });

  const [validateLicenseForCourseError, setValidateLicenseForCourseError] = useState();
  const onValidateSubscriptionLicenseForCourseError = useCallback(
    (error) => setValidateLicenseForCourseError(error),
    [],
  );
  const userSubsidyApplicableToCourse = useUserSubsidyApplicableToCourse({
    courseData,
    accessPolicyRedemptionEligibilityData,
    isPolicyRedemptionEnabled,
    subscriptionLicense,
    courseService,
    couponCodes,
    canEnrollWithEnterpriseOffers,
    enterpriseOffers,
    onValidateSubscriptionLicenseForCourseError,
  });

  const error = fetchCourseDataError || validateLicenseForCourseError;

  const initialState = useMemo(
    () => {
      const isLoadingAny = (
        isLoadingCourseData || isLoadingAccessPolicyRedemptionStatus
      );

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
        userSubsidyApplicableToCourse,
        catalog,
        algoliaSearchParams,
        courseRecommendations: {
          allRecommendations: allRecommendations?.slice(0, 3),
          samePartnerRecommendations: samePartnerRecommendations?.slice(0, 3),
        },
        isPolicyRedemptionEnabled,
      };
    },
    [
      userSubsidyApplicableToCourse,
      isLoadingCourseData,
      isLoadingAccessPolicyRedemptionStatus,
      courseData,
      courseRecommendations,
      algoliaSearchParams,
      isPolicyRedemptionEnabled,
    ],
  );

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading course" />
      </Container>
    );
  }

  // If there isn't an active course run we don't show the course at all
  // TODO: ensure this event is only dispatched once.
  if (!initialState.activeCourseRun) {
    sendEnterpriseTrackEvent(
      enterpriseConfig.uuid,
      'edx.ui.enterprise.learner_portal.course.activeCourseRunNotFound',
      {
        course_key: courseKey,
      },
    );
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${initialState.course.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <CourseEnrollmentsContextProvider>
        <CourseContextProvider initialState={initialState}>
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
