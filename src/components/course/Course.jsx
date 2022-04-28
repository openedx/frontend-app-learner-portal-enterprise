import React, { useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';

import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { CourseContextProvider } from './CourseContextProvider';
import CourseHeader from './CourseHeader';
import CourseMainContent from './CourseMainContent';
import CourseSidebar from './CourseSidebar';

import { useAllCourseData, useExtractAndRemoveSearchParamsFromURL } from './data/hooks';
import { getActiveCourseRun, getAvailableCourseRuns } from './data/utils';
import NotFoundPage from '../NotFoundPage';
import { SubsidyRequestsContextProvider } from '../enterprise-subsidy-requests';
import CourseRecommendations from './CourseRecommendations';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';

export default function Course() {
  const { courseKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const { search } = useLocation();

  const courseRunKey = useMemo(
    () => {
      const queryParams = new URLSearchParams(search);
      return queryParams.get('course_run_key');
    },
    [search],
  );
  const { subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);

  // extract search queryId and objectId that led to this course page view from
  // the URL query parameters and then remove it to keep the URLs clean.
  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

  const {
    courseData, courseRecommendations, fetchError, isLoading,
  } = useAllCourseData({
    courseKey,
    enterpriseConfig,
    courseRunKey,
    subscriptionLicense,
    offers,
  });

  const initialState = useMemo(
    () => {
      if (isLoading || !courseData || !courseRecommendations) {
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
        algoliaSearchParams,
        courseRecommendations: {
          allRecommendations: allRecommendations?.slice(0, 3),
          samePartnerRecommendations: samePartnerRecommendations?.slice(0, 3),
        },
      };
    },
    [courseData, courseRecommendations, algoliaSearchParams],
  );

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (isLoading || !initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading course" />
      </Container>
    );
  }

  // If there isn't an active course run we don't show the course at all
  if (!initialState.activeCourseRun) {
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${initialState.course.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <SubsidyRequestsContextProvider>
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
              <CourseRecommendations />
            </Row>
          </Container>
        </CourseContextProvider>
      </SubsidyRequestsContextProvider>
    </>
  );
}
