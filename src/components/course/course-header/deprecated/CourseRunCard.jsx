import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Card } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { useLocation } from 'react-router-dom';

import EnrollAction from '../../enrollment/EnrollAction';
import CourseRunCardStatus from '../CourseRunCardStatus';
import { COURSE_AVAILABILITY_MAP } from '../../data/constants';
import {
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isArchived,
  findUserEnrollmentForCourseRun,
  hasCourseStarted,
  findHighestLevelSku,
  pathContainsCourseTypeSlug,
} from '../../data/utils';
import { formatStringAsNumber } from '../../../../utils/common';
import { useSubsidyDataForCourse } from '../../enrollment/hooks';
import {
  useCourseEnrollmentUrl,
  useUserHasSubsidyRequestForCourse,
} from '../../data/hooks';
import { determineEnrollmentType } from '../../enrollment/utils';
import { CourseContext } from '../../CourseContextProvider';

const DATE_FORMAT = 'MMM D';
const DEFAULT_BUTTON_LABEL = 'Enroll';

const CourseRunCard = ({
  courseEntitlements,
  userEntitlements,
  courseRun,
  userEnrollments,
  courseKey,
  missingUserSubsidyReason,
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

  const location = useLocation();
  const { enterpriseConfig } = useContext(AppContext);
  const { userCanRequestSubsidyForCourse } = useContext(CourseContext);

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const {
    userEnrollment,
    isUserEnrolled,
  } = useMemo(
    () => {
      const foundEnrollment = findUserEnrollmentForCourseRun({ userEnrollments, key });
      return {
        userEnrollment: foundEnrollment,
        isUserEnrolled: !!foundEnrollment,
      };
    },
    [userEnrollments, key],
  );

  const {
    subscriptionLicense,
    userSubsidyApplicableToCourse,
  } = useSubsidyDataForCourse();
  const userHasSubsidyRequestForCourse = useUserHasSubsidyRequestForCourse(courseKey);

  const sku = useMemo(
    () => findHighestLevelSku({ seats, courseEntitlements }),
    [seats, courseEntitlements],
  );

  const isExecutiveEducation2UCourse = pathContainsCourseTypeSlug(location.pathname, 'executive-education-2u');

  const enrollmentUrl = useCourseEnrollmentUrl({
    enterpriseConfig,
    key,
    courseRunKey: key,
    location,
    sku,
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    courseUuid: courseRun.courseUuid,
    isExecutiveEducation2UCourse,
  });

  const enrollmentType = determineEnrollmentType({
    subsidyData: { userSubsidyApplicableToCourse },
    userHasSubsidyRequestForCourse,
    isUserEnrolled,
    isEnrollable,
    isCourseStarted,
    isExecutiveEducation2UCourse,
    userCanRequestSubsidyForCourse,
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
      if (isCourseStarted) {
        tempHeading = hasTimeToComplete(courseRun) ? `Starts ${moment().format(DATE_FORMAT)}` : 'Course started';
      }
    }
    return [
      tempHeading,
      tempSubHeading,
      DEFAULT_BUTTON_LABEL,
    ];
  }, [
    courseRunArchived,
    isEnrollable,
    isUserEnrolled,
    userEntitlements,
    courseUuid,
    enrollmentCount,
    isCourseStarted,
    start,
    pacingType,
    availability,
    courseRun,
  ]);

  return (
    <Card>
      <Card.Section>
        <div className="text-center">
          <div className="h4 mb-0">{heading}</div>
          <p className="small">{subHeading}</p>
        </div>
        {!courseRunArchived && (
          <EnrollAction
            enrollLabel={buttonLabel}
            enrollmentType={enrollmentType}
            enrollmentUrl={enrollmentUrl}
            userEnrollment={userEnrollment}
            subscriptionLicense={subscriptionLicense}
            courseRunPrice={courseRun?.firstEnrollablePaidSeatPrice}
          />
        )}
      </Card.Section>
      <CourseRunCardStatus
        isUserEnrolled={isUserEnrolled}
        missingUserSubsidyReason={missingUserSubsidyReason}
      />
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
    firstEnrollablePaidSeatPrice: PropTypes.number,
  }).isRequired,
  userEnrollments: PropTypes.arrayOf(PropTypes.shape({
    isEnrollmentActive: PropTypes.bool.isRequired,
    isRevoked: PropTypes.bool.isRequired,
    courseRunId: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  })).isRequired,
  courseEntitlements: PropTypes.arrayOf(PropTypes.shape({
    sku: PropTypes.string.isRequired,
  })).isRequired,
  userEntitlements: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  missingUserSubsidyReason: PropTypes.shape(),
};

CourseRunCard.defaultProps = {
  missingUserSubsidyReason: undefined,
};

export default CourseRunCard;
