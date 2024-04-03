import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Col, Row,
} from '@openedx/paragon';
import { CheckCircle } from '@openedx/paragon/icons';
import { AppContext } from '@edx/frontend-platform/react';

import { FormattedDate, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests';
import {
  courseUpgradeAvailable,
  getCertificatePriceString,
  getEnrolledCourseRunDetails,
  getNotStartedCourseDetails,
  hasLicenseOrCoupon,
} from './data/utils';
import { linkToCourse } from '../course/data/utils';
import dayjs from '../../utils/dayjs';

const ProgramProgressCourses = ({ courseData }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    subscriptionPlan,
    subscriptionLicense,
    couponCodes: { couponCodesCount },
  } = useContext(UserSubsidyContext);

  const { requestsBySubsidyType } = useContext(SubsidyRequestsContext);

  const userHasLicenseOrCoupon = hasLicenseOrCoupon({
    requestsBySubsidyType,
    subscriptionPlan,
    subscriptionLicense,
    couponCodesCount,
  });

  let coursesCompleted = [];
  let coursesInProgress = [];
  let coursesNotStarted = [];

  const intl = useIntl();

  const courseAboutPageURL = (course) => linkToCourse(course, enterpriseConfig.slug);
  const courseSponsoredByEnterprise = intl.formatMessage(
    {
      id: 'enterprise.dashboard.programs.about.page.course.sponsored',
      defaultMessage: 'Sponsored by {enterpriseName}',
      description: 'Label for course sponsored by enterprise on programs about page',
    },
    {
      enterpriseName: enterpriseConfig.name,
    },
  );

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

  const getCertificatePrice = (course) => {
    const certificatePrice = getCertificatePriceString(course);
    if (userHasLicenseOrCoupon) {
      return (
        <>
          {certificatePrice
          && (
            <del>
              <span className="text-success-500 pr-1.5 pl-1.5"> {certificatePrice}</span>
            </del>
          )}
          {courseSponsoredByEnterprise}
        </>
      );
    }
    return (
      <>
        <span className="pl-2">
          <FormattedMessage
            id="enterprise.dashboard.programs.about.page.course.need.verified.certificate"
            defaultMessage="Needs verified certificate "
            description="Message for verified certificate needed on programs about page"
          />
        </span>
        <span className="text-success-500 pl-2">{certificatePrice}</span>
      </>
    );
  };

  const renderCertificatePurchased = () => (
    <Row className="d-flex align-items-start py-3 pt-5">
      <Col className="d-flex align-items-center">
        <span>
          <FormattedMessage
            id="enterprise.dashboard.programs.about.page.course.purchased.certificate.status"
            defaultMessage="Certificate Status:"
            description="Course purchased certificate status on programs about page"
          />
        </span>
        <CheckCircle className="circle-color pl-1" />
        <span className="pl-1">
          <FormattedMessage
            id="enterprise.dashboard.programs.about.page.course.purchased.certificate"
            defaultMessage="Certificate Purchased"
            description="Message for purhased certificate on programs about page"
          />
        </span>
      </Col>
    </Row>
  );

  const renderCertificatePriceMessage = (course) => (
    <>
      <Row className="d-flex align-items-start py-3 pt-5 add-between-space">
        <Col className="d-flex align-items-center">
          <span>
            <FormattedMessage
              id="enterprise.dashboard.programs.about.page.course.certificate.price"
              defaultMessage="Certificate Status:"
              description="Certificate price on programs about page"
            />
          </span>
          {getCertificatePrice(course)}
        </Col>
      </Row>
      <a
        className="btn btn-outline-primary btn-xs-block float-right mb-2 pt-2"
        href={courseAboutPageURL(course)}
      >
        <FormattedMessage
          id="enterprise.dashboard.programs.about.page.course.upgrade.certificate"
          defaultMessage="Upgrade to Verified"
          description="Message for certificate upgradation on programs about page"
        />
      </a>
    </>
  );

  return (
    <div className="col-10 p-0">
      {coursesInProgress?.length > 0
      && (
        <div className="mb-5">
          <h4 className="white-space-pre">
            <FormattedMessage
              id="enterprise.dashboard.programs.about.page.courses.in.progress"
              defaultMessage="COURSES IN PROGRESS"
              description="Label to show the number of courses in progress on programs about page."
            />
            {'    '}{coursesInProgress.length}
          </h4>
          <hr />
          <div className="courses">
            {coursesInProgress.map((course) => (
              (
                <div className="mt-2.5 pt-2 pl-3 pb-5.5 pr-3" key={course.key}>
                  <h4 className="text-dark-500">{course.title}</h4>
                  <p className="text-gray-500 text-capitalize mt-1">
                    <FormattedMessage
                      id="enterprise.dashboard.programs.about.page.in.progress.course.pacing.type.and.start.date"
                      defaultMessage="Enrolled: ({pacingType}) Started {startDate}"
                      description="Placeholder for in-progress course pacing type and start date on programs about page."
                      values={{
                        pacingType: course?.pacingType.replace('_', '-'),
                        startDate: (
                          <FormattedDate
                            value={dayjs(course.start)}
                            format="MMMM Do, YYYY"
                          />
                        ),
                      }}
                    />
                  </p>
                  <a
                    className="btn btn-outline-primary btn-xs-block float-right mb-4 mt-4"
                    href={courseAboutPageURL(course)}
                  >
                    {course.isEnded ? (
                      <FormattedMessage
                        id="enterprise.dashboard.programs.about.page.view.archived.course"
                        defaultMessage="View Archived Course"
                        description="Label for view archived course button"
                      />
                    ) : (
                      <FormattedMessage
                        id="enterprise.dashboard.programs.about.page.view.course"
                        defaultMessage="View Course"
                        description="Label for view course button"
                      />
                    )}
                  </a>
                  {course.certificateUrl
                    ? renderCertificatePurchased()
                    : courseUpgradeAvailable(course)
                    && renderCertificatePriceMessage(course)}
                </div>
              )
            ))}
          </div>
        </div>
      )}
      {courseData?.notStarted?.length > 0
      && (
        <div className="mb-5 courses">
          <h4 className="white-space-pre">
            <FormattedMessage
              id="enterprise.dashboard.programs.about.page.remaining.courses"
              defaultMessage="REMAINING COURSES"
              description="Label to show the number of remaining courses on programs about page."
            />
            {'    '}{courseData?.notStarted?.length}
          </h4>
          <hr />
          {courseWithSingleCourseRun.map((course) => (
            (
              <div className="mt-4.5 pl-3 pb-5 pr-3" key={course.key}>
                <h4 className="text-dark-500">{course.title}</h4>
                {course.isEnrollable
                  ? (
                    <>
                      <p className="text-gray-500 text-capitalize mt-1">
                        <FormattedMessage
                          id="enterprise.dashboard.programs.about.page.remaining.course.pacing.type.and.start.date"
                          defaultMessage="({pacingType}) Starts {startDate}"
                          description="Placeholder for remaining course pacing type and start date on programs about page."
                          values={{
                            pacingType: course?.pacingType.replace('_', '-'),
                            startDate: (
                              <FormattedDate
                                value={dayjs(course.start)}
                                format="MMMM Do, YYYY"
                              />
                            ),
                          }}
                        />
                      </p>
                      <a
                        className="btn btn-outline-primary btn-xs-block mt-2 float-right"
                        href={courseAboutPageURL(course)}
                      >
                        <FormattedMessage
                          id="enterprise.dashboard.programs.about.page.enroll.now.button"
                          defaultMessage="Enroll now"
                          description="Label for enroll now button on programs about page"
                        />
                      </a>
                    </>
                  )
                  : (
                    <p
                      className=" mt-2 float-right"
                    >
                      <FormattedMessage
                        id="enterprise.dashboard.programs.about.page.not.currently.available"
                        defaultMessage="Not Currently Available"
                        description="Text for course not currently available on programs about page"
                      />
                    </p>
                  )}
              </div>
            )
          ))}

          {courseWithMultipleCourseRun.map((course) => (
            (
              <div className="mt-4.5 pl-3 pb-5 pr-3" key={course.key}>
                <h4 className="text-dark-500">{course.title}</h4>
                {course.isEnrollable
                  ? (
                    <>
                      <p className="text-gray-500 text-capitalize mt-1">
                        {course.courseRunDate?.length > 1
                          ? (
                            <Form.Group className="pr-0" as={Col} controlId="formGridState-2">
                              <Form.Label>
                                <FormattedMessage
                                  id="enterprise.dashboard.programs.about.page.available.sessions"
                                  defaultMessage="Your available sessions:"
                                  description="Label for available sessions on programs about page"
                                />
                              </Form.Label>
                              <Form.Control as="select">
                                {course.courseRunDate.map(cRunDate => (
                                  <option>{cRunDate}</option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                          )
                          : (
                            <span data-testid="course-run-single-date">
                              <FormattedMessage
                                id="enterprise.dashboard.programs.about.page.course.run.single.date.pacing.type.and.start.date"
                                defaultMessage="({pacingType}) Starts {startDate}"
                                description="Placeholder for the pacing type and start date of a course with a single course run date on programs about page."
                                values={{
                                  pacingType: course?.pacingType.replace('_', '-'),
                                  startDate: (
                                    <FormattedDate
                                      value={dayjs(course.start)}
                                      format="MMMM Do, YYYY"
                                    />
                                  ),
                                }}
                              />
                            </span>
                          )}
                      </p>
                      <a
                        className="btn btn-outline-primary btn-xs-block mt-2 float-right"
                        href={courseAboutPageURL(course)}
                      >
                        <FormattedMessage
                          id="enterprise.dashboard.programs.about.page.learn.more"
                          defaultMessage="Learn more"
                          description="Label for the learn more button associated with a course on the programs about page. Clicking this button opens the course detail page."
                        />
                      </a>
                    </>
                  )
                  : (
                    <p className="mt-2 float-right">
                      <FormattedMessage
                        id="enterprise.dashboard.programs.about.page.course.not.currently.available.text"
                        defaultMessage="Not Currently Available"
                        description="Text indicating that the course is not currently available. This is used for unenrollable remaining courses on the programs about page."
                      />
                    </p>
                  )}
              </div>
            )
          ))}
        </div>
      )}
      {coursesCompleted?.length > 0
      && (
        <div className="mb-6 courses">
          <h4 className="white-space-pre">
            <FormattedMessage
              id="enterprise.dashboard.programs.about.page.completed.courses"
              defaultMessage="COURSES COMPLETED"
              description="Label to show the number of completed courses on programs about page"
            />
            {'    '}{coursesCompleted.length}
          </h4>
          <hr />
          {coursesCompleted.map((course) => (
            (
              <div className="mt-4.5 pl-3 pb-5 pr-3" key={course.key}>
                <h4 className="text-dark-500">{course.title}</h4>
                <p className="text-gray-500 text-capitalize mt-1">
                  <FormattedMessage
                    id="enterprise.dashboard.programs.about.page.completed.course.pacing.type.and.start.date"
                    defaultMessage="({pacingType}) Started {startDate}"
                    description="Placeholder for completed course pacing type and start date on programs about page."
                    values={{
                      pacingType: course?.pacingType.replace('_', '-'),
                      startDate: (
                        <FormattedDate
                          value={dayjs(course.start)}
                          format="MMMM Do, YYYY"
                        />
                      ),
                    }}
                  />
                </p>
                <a
                  className="btn btn-outline-primary btn-xs-block mb-6 float-right"
                  href={courseAboutPageURL(course)}
                >
                  <FormattedMessage
                    id="enterprise.dashboard.programs.about.page.view.completed.course"
                    defaultMessage="View Course"
                    description="Lable for view completed course button on programs about page"
                  />
                </a>

                {course.certificateUrl ? renderCertificatePurchased()
                  : courseUpgradeAvailable(course)
                  && renderCertificatePriceMessage(course)}
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
