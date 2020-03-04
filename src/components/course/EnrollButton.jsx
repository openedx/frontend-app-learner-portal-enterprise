import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { Button } from '@edx/paragon';

import CourseContext from './CourseContext';

import { enrollUser } from './data/service';

function hasCourseStarted(start) {
  const today = new Date();
  const startDate = new Date(start);
  return startDate && today >= startDate;
}

function isUserEnrolledInCourse({ userEnrollments, key }) {
  return userEnrollments.some(({ courseDetails: { courseId } }) => courseId === key);
}

function isUserEntitledForCourse({ userEntitlements, courseUuid }) {
  return userEntitlements.some(({ courseUuid: uuid }) => uuid === courseUuid);
}

function weeksRemainingUntilEnd(courseRun) {
  const today = new Date();
  const end = new Date(courseRun.end);
  const secondsDifference = Math.abs(end - today) / 1000;
  const days = Math.floor(secondsDifference / 86400);
  return Math.floor(days / 7);
}

function hasTimeToComplete(courseRun) {
  return courseRun.weeksToComplete <= weeksRemainingUntilEnd(courseRun);
}

function isArchived(courseRun) {
  if (courseRun.availability) {
    return courseRun.availability.toLowerCase() === 'archived';
  }
  return false;
}

function isCourseSelfPaced(pacingType) {
  return pacingType === 'self_paced';
}

export default function EnrollButton() {
  const {
    activeCourseRun,
    userEnrollments,
    userEntitlements,
  } = useContext(CourseContext);
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

  useEffect(() => {
    if (enrollmentSubmitted) {
      window.location.href = `${process.env.LMS_BASE_URL}/course_modes/choose/${key}`;
    }
  }, [enrollmentSubmitted]);

  const isCourseStarted = hasCourseStarted(start);
  const isUserEnrolled = isUserEnrolledInCourse({ userEnrollments, key });

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

  const enroll = () => {
    setIsEnrollDisabled(true);
    enrollUser({ course_id: key, email_opt_in: emailOptIn })
      .then(() => {
        setEnrollmentSubmitted(true);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  };

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
