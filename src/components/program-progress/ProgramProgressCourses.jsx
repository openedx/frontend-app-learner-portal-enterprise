import React, { useContext } from 'react';

import PropTypes from 'prop-types';
import {
  Form, Col, Row,
} from '@edx/paragon';
import moment from 'moment';
import { CheckCircle } from '@edx/paragon/icons';
import { AppContext } from '@edx/frontend-platform/react';
import { getEnrolledCourseRunDetails, getNotStartedCourseDetails } from './data/utils';

const ProgramProgressCourses = ({ courseData }) => {
  const { enterpriseConfig } = useContext(AppContext);
  let coursesCompleted = [];
  let coursesInProgress = [];
  let coursesNotStarted = [];
  const courseAboutPageURL = (key) => `/${enterpriseConfig.slug}/course/${key}`;

  if (courseData?.completed) {
    coursesCompleted = getEnrolledCourseRunDetails(courseData.completed);
  }
  if (courseData?.inProgress) {
    coursesInProgress = getEnrolledCourseRunDetails(courseData.inProgress);
  }
  if (courseData?.notStarted) {
    coursesNotStarted = getNotStartedCourseDetails(courseData.notStarted);
  }
  const { courseWithMultipleCourseRun, courseWithSingleCourseRun } = coursesNotStarted;

  const renderCertificatePurchased = () => (
    <Row className="d-flex align-items-start py-3 pt-5">
      <Col className="d-flex align-items-center">
        <span>Certificate Status: </span>
        <CheckCircle className="fa fa-check-circle circle-color" />
        <span>Certificate Purchased</span>
      </Col>
    </Row>
  );
  return (
    <div className="col-8">
      {coursesInProgress?.length > 0
      && (
        <div className="mb-5">
          <h4>COURSES IN PROGRESS {coursesInProgress.length}</h4>
          <hr />
          {coursesInProgress.map((course) => (
            (
              <div className="mt-4.5 ml-4 pb-5">
                <h4 className="text-dark-500">{course.title}</h4>
                <p className="text-gray-500 text-capitalize mt-1">Enrolled:
                  ({course?.pacingType.replace('_', '-')}) Started {moment(course.start)
                  .format('MMMM Do, YYYY')}
                </p>
                <a
                  className="btn btn-outline-primary btn-xs-block float-right mb-6"
                  href={courseAboutPageURL(course.key)}
                >
                  View Course
                </a>
                {course.certificateUrl
                && renderCertificatePurchased()}
              </div>
            )
          ))}
        </div>
      )}
      {courseData?.notStarted?.length > 0
      && (
        <div className="mb-5">
          <h4> REMAINING COURSES {courseData?.notStarted?.length}</h4>
          <hr />
          {courseWithSingleCourseRun.map((course) => (
            (
              <div className="mt-4.5 ml-4 pb-5">
                <h4 className="text-dark-500">{course.title}</h4>
                <p className="text-gray-500 text-capitalize mt-1">
                  ({course?.pacingType.replace('_', '-')}) Starts {moment(course.start)
                    .format('MMMM Do, YYYY')}
                </p>
                <a
                  className="btn btn-outline-primary btn-xs-block mt-2 float-right"
                  href={courseAboutPageURL(course.key)}
                >
                  Enroll Now
                </a>
              </div>
            )
          ))}

          {courseWithMultipleCourseRun.map((course) => (
            (
              <div className="mt-4.5 ml-4 pb-5">
                <h4 className="text-dark-500">{course.title}</h4>
                <p className="text-gray-500 text-capitalize mt-1">
                  <Form.Group className="pr-0" as={Col} controlId="formGridState-2">
                    <Form.Label>Your available sessions:</Form.Label>
                    <Form.Control as="select">
                      {course.courseRunDate.map(cRunDate => (
                        <option>{cRunDate}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </p>
                <a
                  className="btn btn-outline-primary btn-xs-block mt-2 float-right"
                  href={courseAboutPageURL(course.key)}
                >
                  Learn More
                </a>
              </div>
            )
          ))}
        </div>
      )}
      {coursesCompleted?.length > 0
      && (
        <div className="mb-6">
          <h4> COURSES COMPLETED {coursesCompleted.length}</h4>
          <hr />
          {coursesCompleted.map((course) => (
            (
              <div className="mt-4.5 ml-4 pb-5">
                <h4 className="text-dark-500">{course.title}</h4>
                <p className="text-gray-500 text-capitalize mt-1">
                  ({course?.pacingType.replace('_', '-')}) Started {moment(course.start)
                    .format('MMMM Do, YYYY')}
                </p>
                <a
                  className="btn btn-outline-primary btn-xs-block mb-6 float-right"
                  href={courseAboutPageURL(course.key)}
                >
                  View Course
                </a>

                {course.certificateUrl
                && renderCertificatePurchased()}
              </div>
            )
          ))}
        </div>
      )}
    </div>

  );
};
ProgramProgressCourses.propTypes = {
  courseData: PropTypes.shape([]).isRequired,
};
export default ProgramProgressCourses;
