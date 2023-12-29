import React, { useContext } from 'react';

import dayjs from 'dayjs';
import {
  Alert, Collapsible, Hyperlink, Icon,
} from '@openedx/paragon';
import {
  CalendarMonth, ExpandLess, ExpandMore, LibraryBooks,
  WarningFilled,
} from '@openedx/paragon/icons';
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
    (a, b) => (dayjs(a.start) < dayjs(b.start) ? 1 : -1),
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
                  <div className="marker"><Icon src={LibraryBooks} className="mr-2" /></div>
                  <h4 className="h4 flex-grow-1">{course.title}</h4>
                  <Collapsible.Visible whenClosed>
                    <Icon src={ExpandMore} className="mr-2" />
                  </Collapsible.Visible>

                  <Collapsible.Visible whenOpen>
                    <Icon src={ExpandLess} className="mr-2" />
                  </Collapsible.Visible>
                </Collapsible.Trigger>

                <Collapsible.Body className="collapsible-body mt-3 ml-4.5">
                  {
                    (courseRun?.pacingType === PROGRAM_PACING_MAP.INSTRUCTOR_PACED && courseRun.start)
                    && (
                      <div className="course-card-result mb-2 d-flex">
                        <Icon src={CalendarMonth} className="mr-2" />
                        <span className="font-weight-bold">Starts {dayjs(courseRun.start).format(DATE_FORMAT)}</span>
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
