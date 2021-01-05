import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import {
  COURSE_AVAILABILITY_MAP,
  ENROLL_BUTTON_LABEL_COMING_SOON,
  ENROLL_BUTTON_LABEL_NOT_AVAILABLE,
} from '../data/constants';
import {
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isArchived,
} from '../data/utils';

const EnrollButtonLabel = ({
  activeCourseRun,
  isCourseStarted,
  isUserEnrolled,
  userEntitlements,
}) => {
  const {
    start,
    availability,
    isEnrollable,
    courseUuid,
    pacingType,
  } = activeCourseRun;
  // See https://openedx.atlassian.net/wiki/spaces/WS/pages/1045200922/Enroll+button+and+Course+Run+Selector+Logic
  // for more detailed documentation on the enroll button labeling based off course run states.
  const DATE_FORMAT = 'MMM D, YYYY';
  if (!isEnrollable) {
    const availabilityStates = [
      COURSE_AVAILABILITY_MAP.UPCOMING,
      COURSE_AVAILABILITY_MAP.STARTING_SOON,
    ];
    return availabilityStates.includes(availability)
      ? ENROLL_BUTTON_LABEL_COMING_SOON
      : ENROLL_BUTTON_LABEL_NOT_AVAILABLE;
  }
  if (!isUserEnrolled) {
    if (isUserEntitledForCourse({ userEntitlements, courseUuid })) {
      return <span className="enroll-btn-label">View on Dashboard</span>;
    }
    if (isCourseSelfPaced(pacingType)) {
      if (isCourseStarted && hasTimeToComplete(activeCourseRun) && !isArchived(activeCourseRun)) {
        return (
          <>
            <span className="enroll-btn-label">Enroll</span>
            <div><small>Starts {moment().format(DATE_FORMAT)}</small></div>
          </>
        );
      }
      return <span className="enroll-btn-label">Enroll</span>;
    }
    return (
      <>
        <span className="enroll-btn-label">Enroll</span>
        <div>
          <small>
            {isCourseStarted ? 'Started' : 'Starts'}
            {' '}
            {moment(start).format(DATE_FORMAT)}
          </small>
        </div>
      </>
    );
  }
  if (isUserEnrolled && !isCourseStarted) {
    return <span className="enroll-btn-label">You are Enrolled</span>;
  }
  return <span className="enroll-btn-label">View Course</span>;
};

EnrollButtonLabel.propTypes = {
  activeCourseRun: PropTypes.shape().isRequired,
  isCourseStarted: PropTypes.bool.isRequired,
  isUserEnrolled: PropTypes.bool.isRequired,
  userEntitlements: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default EnrollButtonLabel;
