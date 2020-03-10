import React from 'react';

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

export function getActiveCourseRun(course) {
  if (!course || !course.courseRuns || course.courseRuns.length === 0) {
    return undefined;
  }
  return course.courseRuns.pop();
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
    return courseRun.availability.toLowerCase() === 'archived';
  }
  return false;
}

export function isCourseSelfPaced(pacingType) {
  return pacingType === 'self_paced';
}

export function programIsMicroMasters(type) {
  return type.toLowerCase() === 'micromasters';
}

export function programIsProfessionalCertificate(type) {
  return type.toLowerCase() === 'professional certificate';
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
  switch (programType.toLowerCase()) {
    case 'micromasters':
    case 'microbachelors':
      return <>{programType}<sup>&reg;</sup> Program</>;
    case 'masters':
      return 'Master\'s';
    default:
      return programType;
  }
}

export function getProgramIcon(type) {
  switch (type) {
    case 'XSeries':
      return XSeriesSvgIcon;
    case 'Professional Certificate':
      return ProfessionalSvgIcon;
    case 'MicroMasters':
      return MicroMastersSvgIcon;
    case 'Credit':
      return CreditSvgIcon;
    default:
      return VerifiedSvgIcon;
  }
}
