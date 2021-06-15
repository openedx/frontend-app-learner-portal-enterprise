import React from 'react';

import {
  COURSE_AVAILABILITY_MAP,
  PROGRAM_TYPE_MAP,
  COURSE_PACING_MAP,
  COURSE_MODES_MAP,
  LICENSE_SUBSIDY_TYPE,
  OFFER_SUBSIDY_TYPE,
} from './constants';

import MicroMastersSvgIcon from '../../../assets/icons/micromasters.svg';
import ProfessionalSvgIcon from '../../../assets/icons/professional.svg';
import VerifiedSvgIcon from '../../../assets/icons/verified.svg';
import XSeriesSvgIcon from '../../../assets/icons/xseries.svg';
import CreditSvgIcon from '../../../assets/icons/credit.svg';

export function hasCourseStarted(start) {
  const today = new Date();
  const startDate = new Date(start);
  return startDate && today >= startDate;
}

export function findUserEnrollmentForCourseRun({ userEnrollments, key }) {
  return userEnrollments.find(
    ({
      isEnrollmentActive,
      isRevoked,
      courseRunId,
    }) => (isEnrollmentActive && !isRevoked && courseRunId === key),
  );
}

export function isUserEntitledForCourse({ userEntitlements, courseUuid }) {
  return userEntitlements.some(({ courseUuid: uuid }) => uuid === courseUuid);
}

export function weeksRemainingUntilEnd(courseRun) {
  const today = new Date();
  const end = new Date(courseRun.end);
  const secondsDifference = Math.abs(end - today) / 1000;
  const days = Math.floor(secondsDifference / 86400);
  return Math.floor(days / 7);
}

export function hasTimeToComplete(courseRun) {
  return courseRun.weeksToComplete <= weeksRemainingUntilEnd(courseRun);
}

export function isArchived(courseRun) {
  if (courseRun.availability) {
    return courseRun.availability === COURSE_AVAILABILITY_MAP.ARCHIVED;
  }
  return false;
}

export function isCourseSelfPaced(pacingType) {
  return pacingType === COURSE_PACING_MAP.SELF_PACED;
}

export function isCourseInstructorPaced(pacingType) {
  return pacingType === COURSE_PACING_MAP.INSTRUCTOR_PACED;
}

export function programIsMicroMasters(type) {
  return type === PROGRAM_TYPE_MAP.MICROMASTERS;
}

export function programIsProfessionalCertificate(type) {
  return type === PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE;
}

export function getDefaultProgram(programs = []) {
  if (programs.length === 0) {
    return undefined;
  }

  if (programs.length > 2) {
    return programs[0];
  }

  const microMasters = programs.find(({ type }) => programIsMicroMasters(type));
  if (microMasters) {
    return microMasters;
  }

  const professionalCertificate = programs.find(({ type }) => programIsProfessionalCertificate(type));
  if (professionalCertificate) {
    return professionalCertificate;
  }

  return programs[0];
}

export function createCourseInfoUrl({ baseUrl, courseKey }) {
  return `${baseUrl}/courses/${courseKey}/info`;
}

export function formatProgramType(programType) {
  switch (programType) {
    case PROGRAM_TYPE_MAP.MICROMASTERS:
    case PROGRAM_TYPE_MAP.MICROBACHELORS:
      return <>{programType}<sup>&reg;</sup> Program</>;
    case PROGRAM_TYPE_MAP.MASTERS:
      return 'Master\'s';
    default:
      return programType;
  }
}

export function getProgramIcon(type) {
  switch (type) {
    case PROGRAM_TYPE_MAP.XSERIES:
      return XSeriesSvgIcon;
    case PROGRAM_TYPE_MAP.PROFESSIONAL_CERTIFICATE:
      return ProfessionalSvgIcon;
    case PROGRAM_TYPE_MAP.MICROMASTERS:
      return MicroMastersSvgIcon;
    case PROGRAM_TYPE_MAP.CREDIT:
      return CreditSvgIcon;
    default:
      return VerifiedSvgIcon;
  }
}

export const numberWithPrecision = (number, precision = 2) => number.toFixed(precision);

// See https://openedx.atlassian.net/wiki/spaces/WS/pages/1045200922/Enroll+button+and+Course+Run+Selector+Logic
// for more detailed documentation on course run selection and the enroll button.
export function getActiveCourseRun(course) {
  return course.courseRuns.find(courseRun => courseRun.uuid === course.advertisedCourseRunUuid);
}

export function getAvailableCourseRuns(course) {
  return course.courseRuns.filter(
    courseRun => courseRun.isMarketable && courseRun.isEnrollable && !isArchived(courseRun),
  );
}

export function findOfferForCourse(offers, catalogList = []) {
  const offerIndex = offers.findIndex((offer) => catalogList?.includes(offer.catalog));
  if (offerIndex !== -1) {
    return offers[offerIndex];
  }
  return null;
}

const getBestCourseMode = (courseModes) => {
  const {
    VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, AUDIT, HONOR,
  } = COURSE_MODES_MAP;
  /** Returns the 'highest' course mode available.
    *  Modes are ranked ['verified', 'professional', 'no-id-professional', 'audit', 'honor'] */
  if (courseModes.includes(VERIFIED)) {
    return VERIFIED;
  }
  if (courseModes.includes(PROFESSIONAL)) {
    return PROFESSIONAL;
  }
  if (courseModes.includes(NO_ID_PROFESSIONAL)) {
    return NO_ID_PROFESSIONAL;
  }
  if (courseModes.includes(AUDIT)) {
    return AUDIT;
  }
  if (courseModes.includes(HONOR)) {
    return HONOR;
  }
  return null;
};

export function findHighestLevelSeatSku(seats) {
  /** Returns the first seat found from the preferred course mode */
  if (!seats || seats.length <= 0) {
    return null;
  }
  const courseModes = seats.map(seat => seat.type);
  const courseMode = getBestCourseMode(courseModes);
  return seats.find(seat => seat.type === courseMode)?.sku;
}

export function shouldUpgradeUserEnrollment({
  userEnrollment,
  subscriptionLicense,
  enrollmentUrl,
}) {
  const isAuditEnrollment = userEnrollment?.mode === COURSE_MODES_MAP.AUDIT;
  if (isAuditEnrollment && subscriptionLicense && enrollmentUrl) {
    return true;
  }
  return false;
}

export function hasLicenseSubsidy(subsidy) {
  return subsidy?.subsidyType === LICENSE_SUBSIDY_TYPE;
}

export function hasOfferSubsidy(subsidy) {
  return subsidy?.subsidyType === OFFER_SUBSIDY_TYPE;
}

// Truncate a string to less than the maxLength characters without cutting the last word and append suffix at the end
export function shortenString(str, maxLength, suffix, separator = ' ') {
  if (str.length <= maxLength) { return str; }
  return `${str.substr(0, str.lastIndexOf(separator, maxLength))}${suffix}`;
}
