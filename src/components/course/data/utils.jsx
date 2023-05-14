import React from 'react';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { Button, Hyperlink } from '@edx/paragon';
import isNil from 'lodash.isnil';

import {
  COURSE_AVAILABILITY_MAP,
  COURSE_MODES_MAP,
  COURSE_PACING_MAP,
  LICENSE_SUBSIDY_TYPE,
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  ENROLLMENT_FAILED_QUERY_PARAM,
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
  DISABLED_ENROLL_REASON_TYPES,
} from './constants';
import MicroMastersSvgIcon from '../../../assets/icons/micromasters.svg';
import ProfessionalSvgIcon from '../../../assets/icons/professional.svg';
import VerifiedSvgIcon from '../../../assets/icons/verified.svg';
import XSeriesSvgIcon from '../../../assets/icons/xseries.svg';
import CreditSvgIcon from '../../../assets/icons/credit.svg';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';
import { programIsMicroMasters, programIsProfessionalCertificate } from '../../program/data/utils';
import { hasValidStartExpirationDates } from '../../../utils/common';

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

/**
 * Returns list of available that are marketable, enrollable, and not archived.
 *
 * @param {object} course
 * @returns List of course runs.
 */
export function getAvailableCourseRuns(course) {
  return course.courseRuns
    .filter((courseRun) => (
      courseRun.isMarketable
      && courseRun.isEnrollable
      && !isArchived(courseRun)
    ));
}

export function findCouponCodeForCourse(couponCodes, catalogList = []) {
  return couponCodes.find((couponCode) => catalogList?.includes(couponCode.catalog) && hasValidStartExpirationDates({
    startDate: couponCode.couponStartDate,
    endDate: couponCode.couponEndDate,
  }));
}

/**
 * Determines the sort order of two enterprise offers based on the
 * specified property for the user. Returns -1 if the first offer should
 * be prioritized, 1 if the second offer should be prioritized, and 0 if
 * there is no difference in priority.
 *
 * @param {object} args
 * @param {object} args.firstOffer An enterprise offer to compare with the second offer.
 * @param {object} args.secondOffer An enterprise offer to compare with the first offer.
 *
 * @returns The sort comparison value.
 */
export const compareOffersByProperty = ({ firstOffer, secondOffer, property }) => {
  const firstOfferValue = firstOffer[property];
  const secondOfferValue = secondOffer[property];
  if (firstOfferValue && secondOfferValue) {
    if (firstOfferValue < secondOfferValue) { return -1; }
    if (firstOfferValue >= secondOfferValue) { return 1; }
  }
  if (!firstOfferValue && secondOfferValue) { return -1; }
  if (firstOfferValue && !secondOfferValue) { return 1; }
  return undefined;
};

/**
 * Returns an applicable enterprise offer to the specified enterprise catalogs, if one exists, with the
 * following prioritization:
 *   - Offer with no bookings limit (global or user)
 *   - Offer with no applications limit (global or user)
 *   - Offer with user bookings limit
 *   - Offer with global bookings limit
 *   - Offer with user enrollment limit
 *   - Offer with global enrollment limit
 *
 * @param {array} enterpriseOffers List of enterprise offers available for the enterprise customer.
 * @param {number} coursePrice The price of the course.
 *
 * @returns An object containing the metadata for the enterprise offer, if any, most applicable for
 * the specified enterprise catalog uuids and course price.
 */
export const findEnterpriseOfferForCourse = ({
  enterpriseOffers,
  catalogsWithCourse,
  coursePrice,
}) => {
  if (!coursePrice) {
    return undefined;
  }

  const orderedEnterpriseOffers = enterpriseOffers
    .filter((enterpriseOffer) => {
      const isCourseInCatalog = catalogsWithCourse.includes(enterpriseOffer.enterpriseCatalogUuid);
      if (!isCourseInCatalog) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const isFirstOfferRedeemable = a.disabledEnrollReasonType === null;
      const isSecondOfferRedeemable = b.disabledEnrollReasonType === null;
      const firstOffer = a.enterpriseOffer;
      const secondOffer = b.enterpriseOffer;

      let comparison = 0;

      // TODO: verify this comparison logic
      if (isFirstOfferRedeemable && isSecondOfferRedeemable) {
        comparison = compareOffersByProperty({ firstOffer, secondOffer, property: 'remainingApplications' });
        comparison = compareOffersByProperty({ firstOffer, secondOffer, property: 'remainingApplicationsForUser' });
        comparison = compareOffersByProperty({ firstOffer, secondOffer, property: 'remainingBalance' });
        comparison = compareOffersByProperty({ firstOffer, secondOffer, property: 'remainingBalanceForUser' });
      } else if (isFirstOfferRedeemable && !isSecondOfferRedeemable) {
        comparison = -1;
      } else if (!isFirstOfferRedeemable && isSecondOfferRedeemable) {
        comparison = 1;
      } else {
        comparison = 0;
      }

      if (isNil(comparison)) {
        comparison = 0;
      }

      return comparison;
    });

  return orderedEnterpriseOffers[0];
};

const getBestCourseMode = (courseModes) => {
  const {
    VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, AUDIT, HONOR, PAID_EXECUTIVE_EDUCATION,
  } = COURSE_MODES_MAP;

  // Returns the 'highest' course mode available.
  // Modes are ranked ['verified', 'professional', 'no-id-professional', 'audit', 'honor', 'paid-executive-education']
  const courseModesByRank = [VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, PAID_EXECUTIVE_EDUCATION, AUDIT, HONOR];
  const bestCourseMode = courseModesByRank.find((courseMode) => courseModes.includes(courseMode));
  return bestCourseMode || null;
};

export function findHighestLevelSkuByEntityModeType(seatsOrEntitlements, getModeType) {
  /** Returns the first seat found from the preferred course mode */
  const courseModes = seatsOrEntitlements.map(getModeType);
  const courseMode = getBestCourseMode(courseModes);
  if (courseMode) {
    return seatsOrEntitlements.find(entity => getModeType(entity) === courseMode)?.sku;
  }
  return null;
}

export function findHighestLevelSeatSku(seats) {
  /** Returns the first seat found from the preferred course type */
  if (!seats || seats.length <= 0) {
    return null;
  }
  return findHighestLevelSkuByEntityModeType(seats, seat => seat.type);
}

export function findHighestLevelEntitlementSku(entitlements) {
  /** Returns the first entitlement found from the preferred course mode */
  if (!entitlements || entitlements.length <= 0) {
    return null;
  }
  return findHighestLevelSkuByEntityModeType(entitlements, entitlement => entitlement.mode);
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
      maxUserDiscount: applicableEnterpriseOffer.maxUserDiscount,
      maxUserApplications: applicableEnterpriseOffer.maxUserApplications,
      remainingBalance: applicableEnterpriseOffer.remainingBalance,
      remainingBalanceForUser: applicableEnterpriseOffer.remainingBalanceForUser,
      remainingApplications: applicableEnterpriseOffer.remainingApplications,
      remainingApplicationsForUser: applicableEnterpriseOffer.remainingApplicationsForUser,
    };
  }

  return undefined;
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

export const getCourseTypeConfig = (course) => {
  const courseTypeConfig = getConfig()?.COURSE_TYPE_CONFIG;
  if (courseTypeConfig) {
    return courseTypeConfig[course.courseType];
  }
  return null;
};

export const pathContainsCourseTypeSlug = (path, courseType) => {
  const courseTypeConfig = getConfig()?.COURSE_TYPE_CONFIG?.[courseType];
  if (courseTypeConfig) {
    return path.includes(courseTypeConfig?.pathSlug);
  }
  return false;
};

/**
 * Determines whether the subsidy access policy redemption feature is enabled
 * based on a feature flag and whether any course runs are redeemable as determined
 * by the `can-redeem` API response.
 *
 * Allows a temporary "?feature=ENABLE_EMET_REDEMPTION" query parameter to force
 * enable subsidy access policy redemption (e.g., if the `FEATURE_ENABLE_EMET_REDEMPTION`
 * feature flag is disabled).
 *
 * @param {object} args
 * @param {array} args.accessPolicyRedemptionEligibilityData List of objects, each containing a `canRedeem` boolean.
 * @returns True if the feature is enabled and at least one course run is redeemable.
 */
export const checkPolicyRedemptionEnabled = ({
  accessPolicyRedemptionEligibilityData = [],
}) => {
  if (hasFeatureFlagEnabled('ENABLE_EMET_REDEMPTION')) {
    // Always enable the policy redemption feature when enabled via query parameter.
    return true;
  }
  const canRedeemAccessPolicy = accessPolicyRedemptionEligibilityData.some(({ canRedeem }) => canRedeem === true);
  const isFeatureEnabled = getConfig().FEATURE_ENABLE_EMET_REDEMPTION;

  // Enable EMET access policy redemption when the feature is enabled and there is a redeemable access policy.
  if (isFeatureEnabled && canRedeemAccessPolicy) {
    return true;
  }
  return false;
};

export const courseUsesEntitlementPricing = (course) => {
  const courseTypeConfig = getCourseTypeConfig(course);
  if (courseTypeConfig) {
    return courseTypeConfig.usesEntitlementListPrice;
  }
  return false;
};

export function linkToCourse(course, slug) {
  if (!Object.keys(course).length) {
    return '#';
  }
  // If the course type has a path slug configured, add it to the url
  const courseTypeConfig = getCourseTypeConfig(course);
  const slugPlusCourseType = courseTypeConfig?.pathSlug ? `${slug}/${courseTypeConfig.pathSlug}` : slug;
  const baseUrl = `/${slugPlusCourseType}/course/${course.key}`;
  let query = '';
  if (course.queryId && course.objectId) {
    const queryParams = new URLSearchParams();
    queryParams.set('queryId', course.queryId);
    queryParams.set('objectId', course.objectId);
    query = `?${queryParams.toString()}`;
  }
  return `${baseUrl}${query}`;
}

/**
 * Determines the first entitlement price from a list of entitlements.
 *
 * @param {*} entitlements List of course entitlements
 * @returns Price gleaned from entitlements
 */
export function getEntitlementPrice(entitlements) {
  if (entitlements?.length) {
    return Number(entitlements[0].price);
  }
  return undefined;
}

/**
 * Determines the price for a course run.
 *
 * @param {object} args
 * @param {object} args.courseDetails Object containing course type and entitlements properties.
 * @param {number} args.firstEnrollablePaidSeatPrice Price of first enrollable paid seat.
 * @returns Price for the course run.
 */
export const getCourseRunPrice = ({
  courseDetails,
  firstEnrollablePaidSeatPrice,
}) => {
  if (courseUsesEntitlementPricing(courseDetails)) {
    return getEntitlementPrice(courseDetails?.entitlements);
  }
  if (firstEnrollablePaidSeatPrice) {
    return firstEnrollablePaidSeatPrice;
  }
  return undefined;
};

/**
 * Transforms a value into a float with 2 decimal places.
 *
 * @param {*} value
 * @returns Casts value to a float and fixes it to 2 decimal places.
 */
export const fixDecimalNumber = (value) => parseFloat(value).toFixed(2);

/**
 * Determines which CTA button, if any, should be displayed for a given
 * missing subsidy reason.
 *
 * @param {object} args
 * @param {string} args.reasonType Reason type for the missing subsidy.
 * @param {array} args.enterpriseAdminUsers List of enterprise admin users.
 */
export const getMissingSubsidyReasonActions = ({
  reasonType,
  enterpriseAdminUsers,
}) => {
  const hasLimitsLearnMoreCTA = [
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
  ].includes(reasonType);
  const hasOrganizationNoFundsCTA = [
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
  ].includes(reasonType);

  if (hasLimitsLearnMoreCTA) {
    ensureConfig(['LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL']);
    return (
      <Button
        as={Hyperlink}
        destination={getConfig().LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL}
        target="_blank"
        size="sm"
        block
      >
        Learn more
      </Button>
    );
  }

  if (hasOrganizationNoFundsCTA) {
    if (enterpriseAdminUsers?.length === 0) {
      return null;
    }
    const adminEmails = enterpriseAdminUsers.map(({ email }) => email).join(',');
    return (
      <Button
        // TODO: Potentially switch to using MailtoLink here. See https://github.com/openedx/paragon/issues/2278
        as={Hyperlink}
        destination={`mailto:${adminEmails}`}
        target="_blank"
        size="sm"
        block
      >
        Contact administrator
      </Button>
    );
  }

  return null;
};
