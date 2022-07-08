import React, { useContext } from 'react';

import moment from 'moment';
import { Alert, Collapsible, Hyperlink } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WarningFilled } from '@edx/paragon/icons';
import {
  faAngleDown, faAngleUp, faBook, faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '@edx/frontend-platform/react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useParams } from 'react-router-dom';
import { ProgramContext } from './ProgramContextProvider';

import { PROGRAM_PACING_MAP } from './data/constants';

export const DATE_FORMAT = 'MMM D, YYYY';

const getCourseRun = course => (
  // Get the latest course run.
  course.courseRuns?.sort(
    (a, b) => (moment(a.start) < moment(b.start) ? 1 : -1),
  )[0]
);

const ProgramCourses = () => {
  const { enterpriseConfig: { slug, uuid } } = useContext(AppContext);
  const { program } = useContext(ProgramContext);
  const { programUuid } = useParams();
  const { userId } = getAuthenticatedUser();

  return (
    <>
      <h2 className="h2 section-title pb-3"> Courses in this program </h2>
      <div className="courses-in-program-wrapper ml-3 mb-5">
        {
          program.courses && program.courses.map((course) => {
            const courseRun = getCourseRun(course);
            return (
              <Collapsible.Advanced className="collapsible-card-lg" key={course.title}>
                <Collapsible.Trigger className="collapsible-trigger">
                  <div className="marker"><FontAwesomeIcon icon={faBook} className="fa-book mr-2" /></div>
                  <h4 className="h4 flex-grow-1">{course.title}</h4>
                  <Collapsible.Visible whenClosed>
                    <FontAwesomeIcon icon={faAngleDown} className="fa-angle-down mr-2" />
                  </Collapsible.Visible>

                  <Collapsible.Visible whenOpen>
                    <FontAwesomeIcon icon={faAngleUp} className="fa-angle-up mr-2" />
                  </Collapsible.Visible>
                </Collapsible.Trigger>

                <Collapsible.Body className="collapsible-body mt-3 ml-4.5">
                  {
                    (courseRun?.pacingType === PROGRAM_PACING_MAP.INSTRUCTOR_PACED && courseRun.start)
                    && (
                      <div className="course-card-result mb-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="fa-calendar-alt mr-2" />
                        <span className="font-weight-bold">Starts {moment(courseRun.start).format(DATE_FORMAT)}</span>
                      </div>
                    )
                  }

                  {course.shortDescription && (
                    <div
                      className="font-weight-normal mb-4"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: course.shortDescription }}
                    />
                  )}
                  {course.enterpriseHasCourse ? (
                    <Hyperlink
                      isInline
                      destination={`/${slug}/course/${course.key}`}
                      target="_blank"
                      showLaunchIcon={false}
                      onClick={() => {
                        sendEnterpriseTrackEvent(
                          uuid,
                          'edx.ui.enterprise.learner_portal.program.course.clicked',
                          {
                            userId,
                            programUuid,
                            courseKey: course.key,
                          },
                        );
                      }}
                    >
                      View the course
                    </Hyperlink>
                  ) : (
                    <Alert variant="warning" icon={WarningFilled}>
                      This course is not included in your organization&apos;s catalog.
                    </Alert>
                  )}
                </Collapsible.Body>
              </Collapsible.Advanced>
            );
          })

        }
      </div>
    </>
  );
};

export default ProgramCourses;
