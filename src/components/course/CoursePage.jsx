import React, { useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

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
  const { courseKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const { enterpriseConfig: { uuid: enterpriseUUID } } = useContext(AppContext);
  const {
    enterpriseCuration: {
      canOnlyViewHighlightSets,
    },
  } = useEnterpriseCuration(enterpriseUUID);
  const { search } = useLocation();

  const courseRunKey = useMemo(
    () => {
      const queryParams = new URLSearchParams(search);
      return queryParams.get('course_run_key');
    },
    [search],
  );
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodes },
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
  } = useContext(UserSubsidyContext);

  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);

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

  const {
    courseData,
    courseRecommendations,
    courseReviews,
    fetchError,
    isLoadingCourseData,
  } = useAllCourseData({
    courseKey,
    enterpriseConfig,
    courseRunKey,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    activeCatalogs,
  });

  const {
    isInitialLoading: isLoadingAccessPolicyRedemptionStatus,
    data: accessPolicyRedemptionEligibilityData,
  } = useCheckAccessPolicyRedemptionEligibility({
    courseRunKeys: courseData?.courseDetails.courseRunKeys || [],
  });
  const isPolicyRedemptionEnabled = checkPolicyRedemptionEnabled({ accessPolicyRedemptionEligibilityData });

  const initialState = useMemo(
    () => {
      const isLoadingAny = (
        isLoadingCourseData || isLoadingAccessPolicyRedemptionStatus
      );
      if (isLoadingAny || !courseData || !courseRecommendations) {
        return undefined;
      }
      const {
        courseDetails,
        userEnrollments,
        userEntitlements,
        userSubsidyApplicableToCourse,
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
        courseReviews,
        algoliaSearchParams,
        courseRecommendations: {
          allRecommendations: allRecommendations?.slice(0, 3),
          samePartnerRecommendations: samePartnerRecommendations?.slice(0, 3),
        },
        isPolicyRedemptionEnabled,
      };
    },
    [
      isLoadingCourseData,
      isLoadingAccessPolicyRedemptionStatus,
      courseData,
      courseRecommendations,
      courseReviews,
      algoliaSearchParams,
      isPolicyRedemptionEnabled,
    ],
  );

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading course" />
      </Container>
    );
  }

  // If there isn't an active course run we don't show the course at all
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
