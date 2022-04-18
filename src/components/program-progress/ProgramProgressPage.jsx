import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@edx/paragon';
import { ErrorPage } from '@edx/frontend-platform/react';
import { LoadingSpinner } from '../loading-spinner';
import {
  ProgramProgressContextProvider,
} from './ProgramProgressContextProvider';
import ProgramProgressHeader from './ProgramProgressHeader';
import ProgramProgressSideBar from './ProgramProgressSidebar';
import ProgramProgressCourses from './ProgramProgressCourses';

import { useLearnerProgramProgressData } from './data/hooks';
import { SubsidyRequestsContextProvider } from '../enterprise-subsidy-requests';
import { CourseEnrollmentsContextProvider } from '../dashboard/main-content/course-enrollments';
import { getLastEndingCourseDate } from './data/utils';

import SubsidiesSummary from '../dashboard/sidebar/SubsidiesSummary';

const ProgramProgressPage = () => {
  const { programUUID } = useParams();
  const [program, fetchError] = useLearnerProgramProgressData(programUUID);

  const initialState = useMemo(
    () => {
      if (!program) {
        return undefined;
      }
      return program.data;
    },
    [program],
  );
  const courseData = program?.data?.courseData;
  const totalCoursesInProgram = courseData?.notStarted?.length
    + courseData?.completed?.length
    + courseData?.inProgress?.length;
  const allCoursesCompleted = !courseData?.notStarted?.length
    && !courseData?.inProgress?.length
    && courseData?.completed?.length;

  const coursesNotStarted = courseData?.notStarted;
  const totalCoursesNotStarted = coursesNotStarted?.length;
  let courseEndDate;
  if (coursesNotStarted) {
    courseEndDate = getLastEndingCourseDate(coursesNotStarted);
  }
  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (!initialState) {
    return (
      <Container size="lg" className="py-5">
        <LoadingSpinner screenReaderText="loading program progress" />
      </Container>
    );
  }
  const PROGRAM_TITLE = `${initialState.programData.title}`;
  return (
    <>
      <Helmet title={PROGRAM_TITLE} />
      <SubsidyRequestsContextProvider>
        <CourseEnrollmentsContextProvider>
          <ProgramProgressContextProvider initialState={initialState}>
            <Container fluid={false}>
              <ProgramProgressHeader />
              <Row>
                <article className="col-8">
                  {allCoursesCompleted
                    ? (
                      <>
                        <h3>Congratulations!</h3>
                        <p>You have successfully completed all the requirements for the {PROGRAM_TITLE}.</p>
                      </>
                    )
                    : (
                      <>
                        <h3> Your Program Journey</h3>
                        <p>Track and plan your progress through the {totalCoursesInProgram} courses in this program.</p>
                        <p>To complete the program, you must earn a verified certificate for each course.</p>
                      </>
                    )}
                  <SubsidiesSummary
                    totalCoursesNotStarted={totalCoursesNotStarted}
                    courseEndDate={courseEndDate}
                    programProgressPage
                  />
                  <ProgramProgressCourses courseData={courseData} />
                </article>

                <MediaQuery minWidth={breakpoints.large.minWidth}>
                  {matches => matches && (
                    <ProgramProgressSideBar />
                  )}
                </MediaQuery>
              </Row>
            </Container>
          </ProgramProgressContextProvider>
        </CourseEnrollmentsContextProvider>
      </SubsidyRequestsContextProvider>
    </>
  );
};

export default ProgramProgressPage;
