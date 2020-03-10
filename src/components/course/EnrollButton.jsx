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
  console.log('userEnrollments', userEnrollments);
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
   * TODO: this behavior mimics the existing B2C enrollment flow. we will want
   * to redirect learners to the basket flow instead of the track selection page
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
        return <span className="enroll-btn-label">View on Dashboard</span>;
      }
      if (isCourseSelfPaced(pacingType)) {
        if (isCourseStarted && hasTimeToComplete(activeCourseRun) && !isArchived(activeCourseRun)) {
          return (
            <>
              <span className="enroll-btn-label">Enroll</span>
              <div><small>Starts {moment().format('MMM D, YYYY')}</small></div>
            </>
          );
        }
        return <span className="enroll-btn-label">Enroll</span>;
      }
      return (
        <>
          <span className="enroll-btn-label">Enroll</span>
          {!isArchived(activeCourseRun) && (
            <div>
              <small>
                {isCourseStarted ? 'Started' : 'Starts'}
                {' '}
                {moment(start).format('MMM D, YYYY')}
              </small>
            </div>
          )}
        </>
      );
    }
    if (isUserEnrolled && !isCourseStarted) {
      return <span className="enroll-btn-label">You are Enrolled</span>;
    }
    return <span className="enroll-btn-label">View Course</span>;
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
    [key, emailOptIn],
  );

  const renderEnrollCta = () => {
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
        <div className="alert alert-secondary text-center rounded-0">
          {renderButtonLabel()}
        </div>
      );
    }

    if (isUserEnrolled) {
      return (
        <a
          className="btn btn-success btn-block rounded-0 py-2"
          href={isCourseStarted
            ? `${process.env.LMS_BASE_URL}/courses/${key}/info`
            : `${process.env.LMS_BASE_URL}/dashboard`}
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
  };

  return (
    <div className="enroll-wrapper mb-3" style={{ width: 270 }}>
      {renderEnrollCta()}
    </div>
  );
}
