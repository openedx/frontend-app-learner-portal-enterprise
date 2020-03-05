import React, {
  useContext, useEffect, useState, useMemo, useCallback,
} from 'react';
import moment from 'moment';
import { Button } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';

import { enrollUser } from './data/service';

import {
  hasCourseStarted,
  isUserEnrolledInCourse,
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isArchived,
} from './data/utils';

export default function EnrollButton() {
  const { state } = useContext(CourseContext);
  const {
    activeCourseRun,
    userEnrollments,
    userEntitlements,
  } = state;
  const {
    availability,
    key,
    start,
    isEnrollable,
    pacingType,
    courseUuid,
  } = activeCourseRun;
  const [isEnrollDisabled, setIsEnrollDisabled] = useState(false);
  const [emailOptIn] = useState(false);
  const [enrollmentSubmitted, setEnrollmentSubmitted] = useState(false);

  /*
   * TODO: this behavior mimics the existing B2C enrollment flow. instead, we will
   * want to redirect learners to the basket flow instead of the track selection page
   */
  useEffect(() => {
    if (enrollmentSubmitted) {
      // redirect to track selection page
      window.location.href = `${process.env.LMS_BASE_URL}/course_modes/choose/${key}`;
    }
  }, [enrollmentSubmitted]);

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );
  const isUserEnrolled = useMemo(
    () => isUserEnrolledInCourse({ userEnrollments, key }),
    [userEnrollments, key],
  );

  const renderButtonLabel = () => {
    if (!isEnrollable) {
      return availability in ['Upcoming', 'Starting Soon']
        ? 'Coming Soon'
        : 'Not Currently Available';
    }
    if (!isUserEnrolled) {
      if (isUserEntitledForCourse({ userEntitlements, courseUuid })) {
        return <>View on Dashboard</>;
      }
      if (isCourseSelfPaced(pacingType)) {
        if (isCourseStarted && hasTimeToComplete(activeCourseRun) && !isArchived(activeCourseRun)) {
          return <>Enroll<div><small>Starts {moment().format('MMM D, YYYY')}</small></div></>;
        }
        return <>Enroll</>;
      }
      return (
        <>
          Enroll
          <div>
            <small>
              {isCourseStarted ? 'Started' : 'Starts'}
              {' '}
              {moment(start).format('MMM D, YYYY')}
            </small>
          </div>
        </>
      );
    }
    if (isUserEnrolled && !isCourseStarted) {
      return <>You are Enrolled</>;
    }
    return <>View Course</>;
  };

  const enroll = useCallback(
    () => {
      setIsEnrollDisabled(true);
      enrollUser({ course_id: key, email_opt_in: emailOptIn })
        .then(() => {
          setEnrollmentSubmitted(true);
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    },
    [],
  );

  if (!isUserEnrolled && isEnrollable) {
    return (
      <Button
        className="btn-success btn-block rounded-0 py-2"
        onClick={enroll}
        disabled={isEnrollDisabled}
      >
        {renderButtonLabel()}
      </Button>
    );
  }

  if (!isUserEnrolled && !isEnrollable) {
    return (
      <div className="alert alert-secondary text-center rounded-0">{renderButtonLabel()}</div>
    );
  }

  if (isUserEnrolled) {
    return (
      <a
        href={isCourseStarted
          ? `${process.env.LMS_BASE_URL}/courses/${key}/info`
          : `${process.env.LMS_BASE_URL}/dashboard`}
        className="btn btn-success btn-block rounded-0 py-2"
      >
        {renderButtonLabel()}
      </a>
    );
  }

  return (
    <Button className="btn-success btn-block rounded-0 py-2">
      {renderButtonLabel()}
    </Button>
  );
}
