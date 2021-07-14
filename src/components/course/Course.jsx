import React, { useContext, useMemo } from 'react';
import qs from 'query-string';
import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import MediaQuery from 'react-responsive';
import { breakpoints, Container, Row } from '@edx/paragon';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { MainContent, Sidebar } from '../layout';
import { LoadingSpinner } from '../loading-spinner';
import { CourseContextProvider } from './CourseContextProvider';
import CourseHeader from './CourseHeader';
import CourseMainContent from './CourseMainContent';
import CourseSidebar from './CourseSidebar';

import { useAllCourseData, useExtractAndRemoveSearchParamsFromURL } from './data/hooks';
import { getActiveCourseRun, getAvailableCourseRuns } from './data/utils';
import NotFoundPage from '../NotFoundPage';

export default function Course() {
  const { courseKey } = useParams();
  const { enterpriseConfig } = useContext(AppContext);
  const { search } = useLocation();

  const queryParams = useMemo(
    () => camelCaseObject(qs.parse(search)),
    [search],
  );
  const { courseRunKey } = queryParams;

  // extract search queryId and objectId that led to this course page view from
  // the URL query parameters and then remove it to keep the URLs clean.
  const algoliaSearchParams = useExtractAndRemoveSearchParamsFromURL();

  const [courseData, fetchError] = useAllCourseData({
    courseKey,
    enterpriseConfig,
    courseRunKey,
  });

  const initialState = useMemo(
    () => {
      if (!courseData) {
        return undefined;
      }
      const {
        courseDetails,
        userEnrollments,
        userEntitlements,
        userSubsidyApplicableToCourse,
        catalog,
      } = courseData;

      return {
        course: courseDetails,
        activeCourseRun: getActiveCourseRun(courseDetails),
        availableCourseRuns: getAvailableCourseRuns(courseDetails),
        userEnrollments,
        userEntitlements,
        userSubsidyApplicableToCourse,
        catalog,
        algoliaSearchParams,
      };
    },
    [courseData, algoliaSearchParams],
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
    return <NotFoundPage />;
  }

  const PAGE_TITLE = `${initialState.course.title} - ${enterpriseConfig.name}`;

  return (
    <>
      <Helmet title={PAGE_TITLE} />
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
          </Row>
        </Container>
      </CourseContextProvider>
    </>
  );
}
