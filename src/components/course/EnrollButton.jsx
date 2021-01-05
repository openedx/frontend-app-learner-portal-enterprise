import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import EnrollButtonLabel from './enrollment/EnrollButtonLabel';
import { CourseContext } from './CourseContextProvider';
import { useEnrollData, useSubsidyData } from './data/hooks';
import EnrollAction from './enrollment/EnrollAction';
import { determineEnrollmentType } from './enrollment/utils';

export default function EnrollButton() {
  const { state: courseData } = useContext(CourseContext);
  const { activeCourseRun, userEntitlements } = courseData;
  const {
    isUserEnrolled, isEnrollable, isCourseStarted, userEnrollment,
  } = useEnrollData();
  const subsidyData = useSubsidyData({ location: useLocation() });
  const { enrollmentUrl, subscriptionLicense } = subsidyData;

  // decide which enrollment type applies (one of the various scenarios supported)
  const enrollmentType = determineEnrollmentType({
    activeCourseRun,
    userEntitlements,
    isUserEnrolled,
    isEnrollable,
    isCourseStarted,
    subsidyData,
  });

  const enrollLabel = props => (
    <EnrollButtonLabel
      activeCourseRun={activeCourseRun}
      isCourseStarted={isCourseStarted}
      isUserEnrolled
      userEntitlements={userEntitlements}
      {...props}
    />
  );

  // render the correct enrollment action based on type and other inputs
  return (
    <EnrollAction
      enrollmentType={enrollmentType}
      enrollLabel={enrollLabel}
      enrollmentUrl={enrollmentUrl}
      userEnrollment={userEnrollment}
      subscriptionLicense={subscriptionLicense}
    />
  );
}
