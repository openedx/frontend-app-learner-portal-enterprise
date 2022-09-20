import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import {
  COURSE_AVAILABILITY_MAP,
  COURSE_MODES_MAP,
  COURSE_PACING_MAP,
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  ENROLLMENT_FAILED_QUERY_PARAM,
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
} from './constants';

import MicroMastersSvgIcon from '../../../assets/icons/micromasters.svg';
import ProfessionalSvgIcon from '../../../assets/icons/professional.svg';
import VerifiedSvgIcon from '../../../assets/icons/verified.svg';
import XSeriesSvgIcon from '../../../assets/icons/xseries.svg';
import CreditSvgIcon from '../../../assets/icons/credit.svg';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';
import { programIsMicroMasters, programIsProfessionalCertificate } from '../../program/data/utils';
import { hasValidStartExpirationDates } from '../../../utils/common';
import { offerHasBookingsLimit } from '../../enterprise-user-subsidy/enterprise-offers/data/utils';

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

export function getDefaultProgram(programs = []) {
  if (programs.length === 0) {
    return undefined;
  }

  if (programs.length > 2) {
    return programs[0];
  }

  const microMasters = programs.find((program) => programIsMicroMasters(program));
  if (microMasters) {
    return microMasters;
  }

  const professionalCertificate = programs.find((program) => programIsProfessionalCertificate(program));
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

export function findCouponCodeForCourse(couponCodes, catalogList = []) {
  return couponCodes.find((couponCode) => catalogList?.includes(couponCode.catalog) && hasValidStartExpirationDates({
    startDate: couponCode.couponStartDate,
    endDate: couponCode.couponEndDate,
  }));
}

export const findEnterpriseOfferForCourse = ({
  enterpriseOffers, catalogList = [], coursePrice,
}) => {
  if (!coursePrice) {
    return undefined;
  }

  return enterpriseOffers.find((enterpriseOffer) => {
    const {
      remainingBalance,
      remainingBalanceForUser,
    } = enterpriseOffer;

    const isCourseInCatalog = catalogList.includes(enterpriseOffer.enterpriseCatalogUuid);

    if (!isCourseInCatalog) {
      return false;
    }

    if (offerHasBookingsLimit(enterpriseOffer)) {
      if (remainingBalance !== null && remainingBalance < coursePrice) {
        return false;
      }

      if (remainingBalanceForUser !== null && remainingBalanceForUser < coursePrice) {
        return false;
      }
    }

    return true;
  });
};

const getBestCourseMode = (courseModes) => {
  const {
    VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, AUDIT, HONOR,
  } = COURSE_MODES_MAP;
  // Returns the 'highest' course mode available.
  // Modes are ranked ['verified', 'professional', 'no-id-professional', 'audit', 'honor']
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
  return !!(isAuditEnrollment && subscriptionLicense && enrollmentUrl);
}

// Truncate a string to less than the maxLength characters without cutting the last word and append suffix at the end
export function shortenString(str, maxLength, suffix, separator = ' ') {
  if (str.length <= maxLength) { return str; }
  return `${str.substr(0, str.lastIndexOf(separator, maxLength))}${suffix}`;
}

export const getSubsidyToApplyForCourse = ({
  applicableSubscriptionLicense = undefined,
  applicableCouponCode = undefined,
  applicableEnterpriseOffer = undefined,
}) => {
  if (applicableSubscriptionLicense) {
    return {
      ...applicableSubscriptionLicense,
      subsidyType: LICENSE_SUBSIDY_TYPE,
    };
  }

  if (applicableCouponCode) {
    return {
      discountType: applicableCouponCode.usageType,
      discountValue: applicableCouponCode.benefitValue,
      startDate: applicableCouponCode.couponStartDate,
      endDate: applicableCouponCode.couponEndDate,
      code: applicableCouponCode.code,
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    };
  }

  if (applicableEnterpriseOffer) {
    return {
      discountType: applicableEnterpriseOffer.usageType.toLowerCase(),
      discountValue: applicableEnterpriseOffer.discountValue,
      startDate: applicableEnterpriseOffer.startDatetime,
      endDate: applicableEnterpriseOffer.endDatetime,
      offerType: applicableEnterpriseOffer.offerType,
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    };
  }

  return null;
};

export const createEnrollFailureUrl = ({ courseRunKey, location }) => {
  const baseQueryParams = new URLSearchParams(location.search);
  baseQueryParams.set(ENROLLMENT_FAILED_QUERY_PARAM, true);
  baseQueryParams.set(ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM, courseRunKey);

  return `${global.location.origin}${location.pathname}?${baseQueryParams.toString()}`;
};

export const createEnrollWithLicenseUrl = ({
  courseRunKey,
  enterpriseId,
  licenseUUID,
  location,
}) => {
  const config = getConfig();

  const queryParams = new URLSearchParams({
    next: `${config.LMS_BASE_URL}/courses/${courseRunKey}/course`,
    failure_url: createEnrollFailureUrl({ courseRunKey, location }),
    license_uuid: licenseUUID,
    course_id: courseRunKey,
    enterprise_customer_uuid: enterpriseId,
    // We don't want any sidebar text we show the data consent page from this workflow since
    // the text on the sidebar is used when a learner is coming from their employer's system.
    left_sidebar_text_override: '',
    source: 'enterprise-learner-portal',
  });
  return `${config.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${queryParams.toString()}`;
};

export const createEnrollWithCouponCodeUrl = ({
  courseRunKey,
  sku,
  code,
  location,
}) => {
  const config = getConfig();
  const failureUrl = createEnrollFailureUrl({ courseRunKey, location });

  const queryParams = new URLSearchParams({
    next: `${config.LMS_BASE_URL}/courses/${courseRunKey}/course`,
    failure_url: failureUrl,
    sku,
    code,
    // Deliberately doubly encoded since it will get parsed on the redirect.
    consent_url_param_string: `failure_url=${encodeURIComponent(failureUrl)}&left_sidebar_text_override=`,
  });

  return `${config.ECOMMERCE_BASE_URL}/coupons/redeem/?${queryParams.toString()}`;
};
