import React, { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from './CourseContextProvider';
import EnrollButtonLabel from './EnrollButtonLabel';
import EnrollAction from './enrollment/EnrollAction';

import { determineEnrollmentType } from './enrollment/utils';
import { useCourseEnrollmentUrl } from './data/hooks';

import { findHighestLevelSeatSku } from './data/utils';
import { useSubsidyDataForCourse, useEnrollData } from './enrollment/hooks';

export default function EnrollButton() {
  const { enterpriseConfig } = useContext(AppContext);
  const { state: courseData } = useContext(CourseContext);

  const {
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    courseHasOffer,
    offers,
  } = useSubsidyDataForCourse();
  const location = useLocation();

  const {
    isUserEnrolled,
    isCourseStarted,
    isEnrollable,
    userEnrollment,
  } = useEnrollData();

  const {
    activeCourseRun,
    userEntitlements,
    catalog: { catalogList },
  } = courseData;

  const {
    availability,
    key,
    start,
    pacingType,
    courseUuid,
    seats,
  } = activeCourseRun;

  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );
  const enrollmentUrl = useCourseEnrollmentUrl({
    catalogList,
    enterpriseConfig,
    key,
    location,
    offers,
    sku,
    subscriptionLicense,
    userSubsidyApplicableToCourse,
  });

  /**
   * ``EnrollLabel`` will receive its arguments from ``EnrollButtonWrapper``, as this
   * component is rendered as its child below.
   *
   * @param {object} args Arguments.
   *
   * @returns {Component} EnrollButtonLabel
   */
  const EnrollLabel = props => (
    <EnrollButtonLabel
      activeCourseRun={activeCourseRun}
      availability={availability}
      courseUuid={courseUuid}
      isCourseStarted={isCourseStarted}
      isEnrollable={isEnrollable}
      isUserEnrolled={!!userEnrollment}
      pacingType={pacingType}
      start={start}
      userEntitlements={userEntitlements}
      {...props}
    />
  );

  const enrollmentType = determineEnrollmentType({
    subsidyData: {
      subscriptionLicense,
      userSubsidyApplicableToCourse,
      enrollmentUrl,
      courseHasOffer,
    },
    isUserEnrolled,
    isEnrollable,
    isCourseStarted,
  });
  return (
    <EnrollAction
      enrollmentType={enrollmentType}
      enrollLabel={<EnrollLabel />}
      enrollmentUrl={enrollmentUrl}
      userEnrollment={userEnrollment}
      subscriptionLicense={subscriptionLicense}
    />
  );
}
