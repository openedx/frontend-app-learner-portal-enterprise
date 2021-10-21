import React, { useContext } from 'react';

import moment from 'moment';
import { Collapsible } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

import { ProgramContext } from './ProgramContextProvider';

const DATE_FORMAT = 'MMM D, YYYY';

const getCourseRun = course => (
  // Get the latest course run.
  course.courseRuns?.sort(
    (a, b) => (moment(a.start) < moment(b.start) ? 1 : -1),
  )[0]
);

const ProgramCourses = () => {
  const { program } = useContext(ProgramContext);

  return (
    <>
      <h2 className="h2 section-title"> Courses in this program </h2>
      <div className="mb-5">
        {
          program.courses && program.courses.map((course) => {
            const courseRun = getCourseRun(course);
            return (
              <Collapsible.Advanced className="collapsible-card-lg" key={course.title}>
                <Collapsible.Trigger className="collapsible-trigger">
                  <h5 className="flex-grow-1">{course.title}</h5>
                  <Collapsible.Visible whenClosed>
                    <FontAwesomeIcon icon={faAngleDown} className="fa-angle-down mr-2" />
                  </Collapsible.Visible>

                  <Collapsible.Visible whenOpen>
                    <FontAwesomeIcon icon={faAngleUp} className="fa-angle-up mr-2" />
                  </Collapsible.Visible>
                </Collapsible.Trigger>

                <Collapsible.Body className="collapsible-body">
                  <div className="course-card-result">
                    <FontAwesomeIcon icon={faCalendarAlt} className="fa-calendar-alt mr-2" />
                    {courseRun && <span>Starts {moment(courseRun.start).format(DATE_FORMAT)}</span>}
                  </div>
                  {course.shortDescription && (
                    <div
                      className="lead font-weight-normal mb-4"
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: course.shortDescription }}
                    />
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
