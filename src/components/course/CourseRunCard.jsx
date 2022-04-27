import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment';
import {
  Card,
} from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import EnrollAction from './enrollment/EnrollAction';
import { enrollButtonTypes } from './enrollment/constants';
import {
  COURSE_AVAILABILITY_MAP,
} from './data/constants';
import {
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isArchived,
  findUserEnrollmentForCourseRun,
  hasCourseStarted,
  findHighestLevelSeatSku,
} from './data/utils';
import { formatStringAsNumber } from '../../utils/common';

import { useSubsidyDataForCourse } from './enrollment/hooks';
import { useCourseEnrollmentUrl } from './data/hooks';
import { determineEnrollmentType } from './enrollment/utils';
import {
  useUserHasSubsidyRequestForCourse,
} from '../enterprise-subsidy-requests/data/hooks';
import { SubsidyRequestsContext } from '../enterprise-subsidy-requests/SubsidyRequestsContextProvider';

const DATE_FORMAT = 'MMM D';
const DEFAULT_BUTTON_LABEL = 'Enroll';

const CourseRunCard = ({
  catalogList,
  userEntitlements,
  courseRun,
  userEnrollments,
  courseKey,
}) => {
  const {
    availability,
    pacingType,
    courseUuid,
    enrollmentCount,
    start,
    key,
    seats,
    isEnrollable,
  } = courseRun;

  const { enterpriseConfig } = useContext(AppContext);

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const userEnrollment = useMemo(
    () => findUserEnrollmentForCourseRun({ userEnrollments, key }),
    [userEnrollments, key],
  );

  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);
  const userHasSubsidyRequestForCourse = useUserHasSubsidyRequestForCourse(courseKey);

  const isUserEnrolled = !!userEnrollment;

  const {
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    courseHasOffer,
    offers,
  } = useSubsidyDataForCourse();

  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );
  const enrollmentUrl = useCourseEnrollmentUrl({
    catalogList,
    enterpriseConfig,
    key,
    offers,
    sku,
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    location: window.location,
  });

  const enrollmentType = determineEnrollmentType({
    subsidyData: {
      subscriptionLicense,
      userSubsidyApplicableToCourse,
      enrollmentUrl,
      courseHasOffer,
      subsidyRequestConfiguration,
    },
    userHasSubsidyRequestForCourse,
    isUserEnrolled,
    isEnrollable,
    isCourseStarted,
  });

  const courseRunArchived = isArchived(courseRun);
  /**
   * Updates to this function should be reflected in docs:
   * see /docs/images/enroll_button_card_generator.rst
   * Generates three string labels used on course run header card
   * heading, subHeading, buttonLabel
   * |¯¯¯¯¯¯¯¯¯¯¯¯¯|
   * |   heading   |
   * |  subHeading |
   * ||¯¯¯¯¯¯¯¯¯¯¯||
   * ||buttonLabel||
   * ||___________||
   * |_____________|
   * @returns {string []}
   */
  const [heading, subHeading, buttonLabel] = useMemo(() => {
    if (courseRunArchived) {
      return [
        'Course archived',
        'Future dates to be announced',
      ];
    }

    if (!isEnrollable) {
      if (
        (availability === COURSE_AVAILABILITY_MAP.UPCOMING || availability === COURSE_AVAILABILITY_MAP.STARTING_SOON)
        && start
      ) {
        // Course will be available in the future
        return [
          'Coming soon',
          `Enroll after ${moment(start).format(DATE_FORMAT)}`,
          DEFAULT_BUTTON_LABEL,
        ];
      }
      // Course no future date availability announced
      return [
        'Enrollment closed',
        'Future dates to be announced',
        DEFAULT_BUTTON_LABEL,
      ];
    }

    if (isUserEnrolled) {
      // User is enrolled
      return [
        !isCourseStarted
          ? `Starts ${moment(start).format(DATE_FORMAT)}`
          : 'Course started',
        'You are enrolled',
        'View course',
      ];
    }
    // User is not enrolled
    if (isUserEntitledForCourse({ userEntitlements, courseUuid })) {
      // Is entitled for course
      return [
        'Entitlement found',
        '',
        'View on dashboard',
      ];
    }
    const tempSubHeading = enrollmentCount > 0
      ? `${formatStringAsNumber(enrollmentCount)} recently enrolled!`
      : 'Be the first to enroll!';

    let tempHeading = `${isCourseStarted ? 'Started' : 'Starts'} ${moment(start).format(DATE_FORMAT)}`;
    if (isCourseSelfPaced(pacingType)) {
      if (isCourseStarted && hasTimeToComplete(courseRun)) {
        // Course is self paced and has time to complete
        tempHeading = `Starts ${moment().format(DATE_FORMAT)}`;
      } else {
        tempHeading = 'Course started';
      }
    }
    return [
      tempHeading,
      tempSubHeading,
      DEFAULT_BUTTON_LABEL,
    ];
  }, [
    isUserEnrolled,
    isEnrollable,
    availability,
    userEntitlements,
    pacingType,
    courseUuid,
    isCourseStarted,
    enrollmentCount,
    start,
  ]);

  return (
    <Card className="w-100">
      <Card.Body className="d-flex flex-column align-items-center justify-content-between">
        <div className={classNames(
          'text-center',
          {
            'mb-3.5': enrollmentType !== enrollButtonTypes.HIDE_BUTTON,
          },
        )}
        >
          <div className="h4 mb-0">{heading}</div>
          <div className="small">{subHeading}</div>
        </div>
        {!courseRunArchived
          && (
            <EnrollAction
              enrollLabel={buttonLabel}
              enrollmentType={enrollmentType}
              enrollmentUrl={enrollmentUrl}
              userEnrollment={userEnrollment}
              subscriptionLicense={subscriptionLicense}
            />
          )}
      </Card.Body>
    </Card>
  );
};

CourseRunCard.propTypes = {
  courseKey: PropTypes.string.isRequired,
  courseRun: PropTypes.shape({
    availability: PropTypes.string.isRequired,
    isEnrollable: PropTypes.bool.isRequired,
    pacingType: PropTypes.string.isRequired,
    courseUuid: PropTypes.string.isRequired,
    enrollmentCount: PropTypes.number,
    start: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    seats: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
  userEnrollments: PropTypes.arrayOf(PropTypes.shape({
    isEnrollmentActive: PropTypes.bool.isRequired,
    isRevoked: PropTypes.bool.isRequired,
    courseRunId: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  })).isRequired,
  userEntitlements: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  catalogList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CourseRunCard;
