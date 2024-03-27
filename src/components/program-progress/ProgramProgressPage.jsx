import { Helmet } from 'react-helmet';
import {
  breakpoints, Container, Row, MediaQuery,
} from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import ProgramProgressHeader from './ProgramProgressHeader';
import ProgramProgressSideBar from './ProgramProgressSidebar';
import ProgramProgressCourses from './ProgramProgressCourses';
import {
  getCoursesEnrolledInAuditMode,
  getNotStartedEnrollableCourseRuns,
  getLastEndingCourseDate,
} from './data/utils';
import SubsidiesSummary from '../dashboard/sidebar/SubsidiesSummary';
import { useProgramProgressDetails } from '../app/data';
import NotFoundPage from '../NotFoundPage';

const ProgramProgressPage = () => {
  const { data: program, isError } = useProgramProgressDetails();

  const courseData = program?.courseData;
  /* eslint-disable no-unsafe-optional-chaining */
  const totalCoursesInProgram = courseData?.notStarted?.length
    + courseData?.completed?.length
    + courseData?.inProgress?.length;
  /* eslint-enable no-unsafe-optional-chaining */
  const allCoursesCompleted = !courseData?.notStarted?.length
    && !courseData?.inProgress?.length
    && courseData?.completed?.length;

  const coursesNotStarted = courseData?.notStarted;
  const totalCoursesNotStarted = coursesNotStarted?.length;
  let enrolledCourses = [];
  if (courseData?.completed?.length) {
    enrolledCourses = courseData.completed;
  }
  if (courseData?.inProgress?.length) {
    enrolledCourses = [...enrolledCourses, ...courseData.inProgress];
  }
  const coursesEnrolledInAuditMode = getCoursesEnrolledInAuditMode(enrolledCourses);
  /* eslint-disable-next-line no-unsafe-optional-chaining */
  const totalCoursesEligibleForCertificate = totalCoursesNotStarted + coursesEnrolledInAuditMode?.length;
  let courseEndDate;
  if (totalCoursesEligibleForCertificate) {
    const notStartedEnrollableCourseRuns = getNotStartedEnrollableCourseRuns(coursesNotStarted);
    const subsidyEligibleCourseRuns = [...notStartedEnrollableCourseRuns, ...coursesEnrolledInAuditMode];

    courseEndDate = getLastEndingCourseDate(subsidyEligibleCourseRuns);
  }
  if (isError) {
    return <NotFoundPage />;
  }

  const PROGRAM_TITLE = `${program.programData.title}`;
  return (
    <>
      <Helmet title={PROGRAM_TITLE} />
      <Container fluid={false} size="lg">
        <ProgramProgressHeader />
        <Row>
          <article className="col-8">
            {allCoursesCompleted
              ? (
                <>
                  <h3>
                    <FormattedMessage
                      id="enterprise.dashboard.programs.about.page.all.courses.completed.message"
                      defaultMessage="Congratulations!"
                      description="Message for all courses completed on programs about page"
                    />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="enterprise.dashboard.programs.about.page.all.course.requirements.completed.message"
                      defaultMessage="You have successfully completed all the requirements for the {programTitle}."
                      description="Message shown when a learner has completed all course requirements for a program."
                      values={{
                        programTitle: PROGRAM_TITLE,
                      }}
                    />
                  </p>
                </>
              )
              : (
                <>
                  <h3>
                    <FormattedMessage
                      id="enterprise.dashboard.programs.about.page.program.journey.message"
                      defaultMessage="Your Program Journey"
                      description="Message for program journey on programs about page"
                    />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="eenterprise.dashboard.programs.about.page.course.progress.tracking.message"
                      defaultMessage="Track and plan your progress through the {totalCoursesInProgram} courses in this program."
                      description="Message for courses progress tracking on programs about page"
                      values={{
                        totalCoursesInProgram,
                      }}
                    />
                  </p>
                  <p>
                    <FormattedMessage
                      id="enterprise.dashboard.programs.about.page.verified.certificate.message"
                      defaultMessage="To complete the program, you must earn a verified certificate for each course."
                      description="Message for verified certificate on programs about page"
                    />
                  </p>
                </>
              )}
            <SubsidiesSummary
              totalCoursesEligibleForCertificate={totalCoursesEligibleForCertificate}
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
    </>
  );
};

export default ProgramProgressPage;
