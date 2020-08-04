import React from 'react';

import {
  COURSE_AVAILABILITY_MAP,
  PROGRAM_TYPE_MAP,
  COURSE_PACING_MAP,
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

export function isUserEnrolledInCourse({ userEnrollments, key }) {
  return userEnrollments.some(({ courseDetails: { courseId } }) => courseId === key);
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
