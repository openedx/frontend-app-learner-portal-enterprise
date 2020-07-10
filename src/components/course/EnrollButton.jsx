import React, {
  useContext, useMemo,
} from 'react';
import moment from 'moment';
import qs from 'query-string';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';

import {
  hasCourseStarted,
  isUserEnrolledInCourse,
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isSavedForLater,
} from './data/utils';
import { UserSubsidyContext } from '../enterprise-user-subsidy/UserSubsidy';

export default function EnrollButton() {
  const { state } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
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

  // This enrollment URL assumes that the learner has access to the course through their subscription license, and they
  // are using the license to enroll.
  // TODO: Update to conditionally use the DSC flow with a license uuid only when the learner is actually using a
  // license.
  const enrollOptions = {
    license_uuid: subscriptionLicense.uuid,
    course_id: key,
    enterprise_customer_uuid: enterpriseConfig.uuid,
    next: `${process.env.LMS_BASE_URL}/dashboard`,
    failure_url: global.location,
  };
  const licenseEnrollmentUrl = `${process.env.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
  const enrollLinkClass = 'btn btn-success btn-block rounded-0 py-2';

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
        if (isCourseStarted && hasTimeToComplete(activeCourseRun) && !isSavedForLater(activeCourseRun)) {
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
          {!isSavedForLater(activeCourseRun) && (
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

  const renderEnrollCta = () => {
    if (!isUserEnrolled && isEnrollable) {
      return (
        <a
          className={enrollLinkClass}
          href={licenseEnrollmentUrl}
        >
          {renderButtonLabel()}
        </a>
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
          className={enrollLinkClass}
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
