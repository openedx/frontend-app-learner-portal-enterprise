import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { hasFeatureFlagEnabled } from '@edx/frontend-enterprise-utils';
import { Button, Hyperlink, MailtoLink } from '@openedx/paragon';
import isNil from 'lodash.isnil';
import { logError } from '@edx/frontend-platform/logging';
import dayjs from '../../../utils/dayjs';

import {
  COURSE_PACING_MAP,
  DISABLED_ENROLL_REASON_TYPES,
  DISABLED_ENROLL_USER_MESSAGES,
  ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM,
  ENROLLMENT_FAILED_QUERY_PARAM,
  ZERO_PRICE,
} from './constants';
import MicroMastersSvgIcon from '../../../assets/icons/micromasters.svg';
import ProfessionalSvgIcon from '../../../assets/icons/professional.svg';
import VerifiedSvgIcon from '../../../assets/icons/verified.svg';
import XSeriesSvgIcon from '../../../assets/icons/xseries.svg';
import CreditSvgIcon from '../../../assets/icons/credit.svg';
import { PROGRAM_TYPE_MAP } from '../../program/data/constants';
import { programIsMicroMasters, programIsProfessionalCertificate } from '../../program/data/utils';
import { formatPrice, hasValidStartExpirationDates, isDefinedAndNotNull } from '../../../utils/common';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import {
  findHighestLevelEntitlementSku,
  findHighestLevelSkuByEntityModeType,
  isEnrollmentUpgradeable,
  START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS,
} from '../../app/data';

/**
 * Determines if the course has already started. Mostly used around text formatting for tense
 *
 * @param start
 * @returns {boolean}
 */
export const hasCourseStarted = (start) => dayjs(start).isBefore(dayjs());

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
  if ((!courseRun.weeksToComplete || !courseRun.end) && dayjs(courseRun.start).isAfter(dayjs(), 'minute')) {
    return true;
  }
  return courseRun.weeksToComplete <= weeksRemainingUntilEnd(courseRun);
}

export function isCourseSelfPaced(pacingType) {
  return [COURSE_PACING_MAP.SELF_PACED, COURSE_PACING_MAP.SELF].includes(pacingType);
}

export function isCourseInstructorPaced(pacingType) {
  return [COURSE_PACING_MAP.INSTRUCTOR_PACED, COURSE_PACING_MAP.INSTRUCTOR].includes(pacingType);
}

export const isWithinMinimumStartDateThreshold = ({ start }) => dayjs(start).isBefore(dayjs().subtract(START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS, 'days'));

/**
 * If the start date of the course is before today offset by the START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS
 * then return today's formatted date. Otherwise, pass-through the start date in ISO format.
 *
 * @param {String} start
 * @param {String} pacingType
 * @param {String} end
 * @param {Number} weeksToComplete
 * @returns {string}
 */
export const getNormalizedStartDate = ({
  start, pacingType, end, weeksToComplete,
}) => {
  const todayToIso = dayjs().toISOString();
  if (!start) {
    return todayToIso;
  }
  const startDateIso = dayjs(start).toISOString();
  if (isCourseSelfPaced(pacingType) && dayjs(startDateIso).isBefore(dayjs())) {
    if (hasTimeToComplete({ end, weeksToComplete }) || isWithinMinimumStartDateThreshold({ start })) {
      // always today's date (incentives enrollment)
      return todayToIso;
    }
  }
  return startDateIso;
};

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

/**
 * Displays content price with precision as a range or singular price
 * @param priceRange
 * @returns {*|string}
 */
export const getContentPriceDisplay = (priceRange) => {
  if (!priceRange?.length) {
    return formatPrice(ZERO_PRICE);
  }
  const minPrice = Math.min(...priceRange);
  const maxPrice = Math.max(...priceRange);
  if (maxPrice !== minPrice) {
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
  }
  return formatPrice(priceRange[0]);
};

/**
 *
 * @param couponCodes
 * @param catalogList
 * @returns {*}
 */
export function findCouponCodeForCourse(couponCodes, catalogList = []) {
  return couponCodes.find((couponCode) => catalogList?.includes(couponCode.catalog) && hasValidStartExpirationDates({
    startDate: couponCode.couponStartDate,
    endDate: couponCode.couponEndDate,
  }));
}

/**
 * Determines if the enterprise offer fields passed are able to deem the offer as redeemable
 *
 * @param {number} remainingBalance - remaining balance for the enterprise from enterprise offers
 * @param {number} remainingBalanceForUser - remaining balance for the user from enterprise offers
 * @param {number} remainingApplications - remaining applications for the enterprise from enterprise offers
 * @param {number} remainingApplicationsForUser - remaining applications for the user from enterprise offers
 * @param {boolean} isCurrent - boolean to determine if the enterprise offer is active or expired
 * @param {number} coursePrice - cost of the price of the course to compare against the remaining balance
 * @returns {
 * {hasRemainingApplications: (boolean|boolean),
 * hasRemainingApplicationsForUser: (boolean|boolean),
 * hasRemainingBalance: (boolean|boolean),
 * hasRemainingBalanceForUser: (boolean|boolean)}
 * }
 */
export const determineIfOfferRedeemableConditions = ({
  remainingBalance,
  remainingBalanceForUser,
  remainingApplications,
  remainingApplicationsForUser,
  isCurrent,
}, coursePrice) => {
  const hasRemainingBalance = !isNil(remainingBalance) ? remainingBalance >= coursePrice : true;
  const hasRemainingBalanceForUser = !isNil(remainingBalanceForUser) ? remainingBalanceForUser >= coursePrice : true;
  const hasRemainingApplications = !isNil(remainingApplications) ? remainingApplications > 0 : true;
  const hasRemainingApplicationsForUser = !isNil(remainingApplicationsForUser)
    ? remainingApplicationsForUser > 0
    : true;

  const isOfferRedeemable = {
    hasRemainingBalance,
    hasRemainingBalanceForUser,
    hasRemainingApplications,
    hasRemainingApplicationsForUser,
  };
  if (!isNil(isCurrent)) {
    isOfferRedeemable.isCurrent = isCurrent;
  }
  return isOfferRedeemable;
};

/**
 * Determines whether an enterprise offer may be applied
 * to a course given the course price and its remaining spend/balance.
 *
 * @param {object} args
 * @param {object} args.offer An enterprise offer.
 * @param {number} args.coursePrice The price of the course.
 */
export const determineOfferRedeemability = ({ offer, coursePrice }) => {
  const isOfferRedeemableConditions = determineIfOfferRedeemableConditions(offer, coursePrice);
  return {
    isRedeemableConditions: isOfferRedeemableConditions,
    isRedeemable: Object.values(isOfferRedeemableConditions).every(condition => condition === true),
  };
};

/**
 * Compares two redeemable enterprise offers, and makes a choice
 * about which one is preferred. Prefers offers without limits,
 * less spend (> $0), and less applications (> 0) remaining.
 *
 * @param {object} args
 * @param {object} args.firstOffer First redeemable offer to compare.
 * @param {object} args.secondOffer Second redeemable offer to compare.
 *
 * @returns A sort comparison value, e.g. -1, 0, or 1.
 */
export const compareRedeemableOffers = ({ firstOffer: a, secondOffer: b }) => {
  const aBalance = a.remainingBalanceForUser ?? a.remainingBalance ?? null;
  const bBalance = b.remainingBalanceForUser ?? b.remainingBalance ?? null;
  const bothHaveBalance = !isNil(aBalance) && !isNil(bBalance);

  const aApplications = a.remainingApplicationsForUser ?? a.remainingApplications ?? null;
  const bApplications = b.remainingApplicationsForUser ?? b.remainingApplications ?? null;
  const bothHaveApplications = !isNil(aApplications) && !isNil(bApplications);

  let priority = 0;

  // check balances
  if (isNil(aBalance) && !isNil(bBalance)) {
    priority -= 1;
  } else if (!isNil(aBalance) && isNil(bBalance)) {
    priority += 1;
  } else if (bothHaveBalance && aBalance < bBalance) {
    priority -= 1;
  } else if (bothHaveBalance && aBalance > bBalance) {
    priority += 1;
  }

  // check applications
  if (isNil(aApplications) && !isNil(bApplications)) {
    priority -= 1;
  } else if (!isNil(aApplications) && isNil(bApplications)) {
    priority += 1;
  } else if (bothHaveApplications && aApplications < bApplications) {
    priority -= 1;
  } else if (bothHaveApplications && aApplications > bApplications) {
    priority += 1;
  }

  return priority; // default case: no changes in sorting order
};

/**
 * Returns an applicable enterprise offer to the specified enterprise catalogs, if one exists, with the
 * following prioritization:
 *   - Offer with no bookings limit
 *   - Offer with no applications limit
 *   - Offer with user bookings limit
 *   - Offer with global bookings limit
 *   - Offer with user enrollment limit
 *   - Offer with global enrollment limit
 *
 * @param {array} enterpriseOffers List of enterprise offers available for the enterprise customer.
 * @param {array} catalogsWithCourse List of catalogs that will be cross-referenced against the catalogUUID from offers
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
    .sort((firstOffer, secondOffer) => {
      const {
        isRedeemable: isFirstOfferRedeemable,
      } = determineOfferRedeemability({ offer: firstOffer, coursePrice });
      const {
        isRedeemable: isSecondOfferRedeemable,
      } = determineOfferRedeemability({ offer: secondOffer, coursePrice });

      if (isFirstOfferRedeemable && !isSecondOfferRedeemable) {
        // prioritize the first offer
        return -1;
      }

      if (!isFirstOfferRedeemable && isSecondOfferRedeemable) {
        // prioritize the second offer
        return 1;
      }

      if (isFirstOfferRedeemable && isSecondOfferRedeemable) {
        // prioritize the offer based on its remaining (user|global) balance and remaining (user|global) applications
        return compareRedeemableOffers({ firstOffer, secondOffer });
      }

      return 0;
    });

  return orderedEnterpriseOffers[0];
};

/**
 * Returns the first seat found from the preferred course type
 */
export function findHighestLevelSeatSku(seats) {
  if (!seats || seats.length <= 0) {
    return null;
  }
  return findHighestLevelSkuByEntityModeType(seats, seat => seat.type);
}

/**
 * Returns the first seat or entitlement found from the preferred course mode.
 */
export function findHighestLevelSku({ courseEntitlements, seats }) {
  return findHighestLevelSeatSku(seats) || findHighestLevelEntitlementSku(courseEntitlements);
}

export function isActiveSubscriptionLicense(subscriptionLicense) {
  return subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
}

export function shouldUpgradeUserEnrollment({
  userEnrollment,
  subscriptionLicense,
  enrollmentUrl,
}) {
  const isAuditEnrollment = isEnrollmentUpgradeable(userEnrollment);
  return !!(isAuditEnrollment && isActiveSubscriptionLicense(subscriptionLicense) && enrollmentUrl);
}

// Truncate a string to less than the maxLength characters without cutting the last word and append suffix at the end
export function shortenString(str, maxLength, suffix, separator = ' ') {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substring(0, str.lastIndexOf(separator, maxLength))}${suffix}`;
}

export const isCurrentCoupon = (coupon) => dayjs().isBetween(
  coupon.startDate,
  coupon.endDate,
  'day',
  '[]',
);

const parseReasonTypeBasedOnEnterpriseAdmins = ({ hasEnterpriseAdminUsers, reasonTypes }) => {
  if (hasEnterpriseAdminUsers) {
    return reasonTypes.hasAdmins;
  }
  return reasonTypes.hasNoAdmins;
};

export const getCouponCodesDisabledEnrollmentReasonType = ({
  catalogsWithCourse,
  couponsOverview,
  hasEnterpriseAdminUsers,
}) => {
  const applicableCouponsToCatalog = couponsOverview?.data?.results.filter(
    coupon => catalogsWithCourse.includes(coupon.enterpriseCatalogUuid),
  ) || [];

  const hasCouponsApplicableToCourse = applicableCouponsToCatalog.length > 0;
  if (!hasCouponsApplicableToCourse) {
    return undefined;
  }

  const hasExpiredCoupons = applicableCouponsToCatalog.every(
    coupon => !isCurrentCoupon(coupon),
  );
  const hasExhaustedCoupons = applicableCouponsToCatalog.every(
    coupon => isCurrentCoupon(coupon) && coupon.numUnassigned === 0,
  );
  const applicableCouponNonExpiredNonExhausted = applicableCouponsToCatalog.find(
    coupon => isCurrentCoupon(coupon) && coupon.numUnassigned > 0,
  );

  if (hasExpiredCoupons) {
    // If customer's coupon(s) containing the course being viewed have expired,
    // change `reasonType` to use the `COUPON_CODES_EXPIRED` message.
    return parseReasonTypeBasedOnEnterpriseAdmins({
      hasEnterpriseAdminUsers,
      reasonTypes: {
        hasAdmins: DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED,
        hasNoAdmins: DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED_NO_ADMINS,
      },
    });
  }

  if (hasExhaustedCoupons || applicableCouponNonExpiredNonExhausted) {
    // If customer has a coupon(s) containing the course being viewed that is not expired
    // nor exhausted, change `reasonType` to use the `COUPON_CODE_NOT_ASSIGNED` message.
    return parseReasonTypeBasedOnEnterpriseAdmins({
      hasEnterpriseAdminUsers,
      reasonTypes: {
        hasAdmins: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
        hasNoAdmins: DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED_NO_ADMINS,
      },
    });
  }

  return undefined;
};

/**
 * Determines whether the learner's subscription license is applicable to the course being
 * viewed, based on the enterprise catalogs associated with the learner's subscription license.
 * @param {Object} args
 * @param {array} args.catalogsWithCourse List of catalogs that will be checked against the license.
 * @param {Object} args.subscriptionLicense Learner's subscription license.
 * @returns {boolean} True if the learner's subscription license is applicable to the course being viewed.
 */
function determineLicenseApplicableToCourse({
  catalogsWithCourse,
  subscriptionLicense,
}) {
  if (!subscriptionLicense) {
    return false;
  }
  return catalogsWithCourse.includes(
    subscriptionLicense.subscriptionPlan.enterpriseCatalogUuid,
  );
}

export const getSubscriptionDisabledEnrollmentReasonType = ({
  customerAgreement,
  catalogsWithCourse,
  subscriptionLicense,
  hasEnterpriseAdminUsers,
}) => {
  // If customer does not have a subscription plan(s) containing the
  // course being viewed, return early.
  const hasSubscriptionPlanApplicableToCourse = !!customerAgreement?.availableSubscriptionCatalogs.some(
    subscriptionCatalogUuid => catalogsWithCourse.includes(subscriptionCatalogUuid),
  );
  if (!hasSubscriptionPlanApplicableToCourse) {
    return undefined;
  }

  // If customer has a subscription plan(s) containing the course being viewed that is not expired
  // nor exhausted but learner has no subscription license application to the course, change `reasonType`
  // to use the `SUBSCRIPTION_LICENSE_NOT_ASSIGNED` message.
  const isLicenseApplicableToCourse = determineLicenseApplicableToCourse({
    catalogsWithCourse,
    subscriptionLicense,
  });
  if (!isLicenseApplicableToCourse) {
    return parseReasonTypeBasedOnEnterpriseAdmins({
      hasEnterpriseAdminUsers,
      reasonTypes: {
        hasAdmins: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
        hasNoAdmins: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
      },
    });
  }

  // If learner's subscription license is expired, change `reasonType` to use
  // the `SUBSCRIPTION_EXPIRED` message.
  const hasExpiredSubscriptionLicense = !subscriptionLicense.subscriptionPlan.isCurrent;
  if (hasExpiredSubscriptionLicense) {
    return parseReasonTypeBasedOnEnterpriseAdmins({
      hasEnterpriseAdminUsers,
      reasonTypes: {
        hasAdmins: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
        hasNoAdmins: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
      },
    });
  }

  // If learner's subscription license is revoked/deactivated, change `reasonType` to use
  // the `SUBSCRIPTION_DEACTIVATED` message.
  if (subscriptionLicense.status === LICENSE_STATUS.REVOKED) {
    return DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED;
  }

  // There is no applicable subscriptions-related reason for disabled enrollment.
  return undefined;
};

export const getEnterpriseOffersDisabledEnrollmentReasonType = ({
  enterpriseOffers,
  catalogsWithCourse,
}) => {
  if (!enterpriseOffers || enterpriseOffers.length === 0) {
    return undefined;
  }

  const offersForCourse = enterpriseOffers.filter(offer => catalogsWithCourse.includes(offer.enterpriseCatalogUuid));

  const hasExpiredOffers = offersForCourse.every(offer => !offer.isCurrent);
  if (hasExpiredOffers) {
    return parseReasonTypeBasedOnEnterpriseAdmins({
      hasEnterpriseAdminUsers: true,
      reasonTypes: {
        hasAdmins: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
        hasNoAdmins: DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED,
      },
    });
  }
  return undefined;
};

/**
 * Determines which CTA button, if any, should be displayed for a given
 * missing subsidy reason.
 *
 * @param {object} args
 * @param {string} args.reasonType Reason type for the missing subsidy.
 * @param {array} args.enterpriseAdminUsers List of enterprise admin users.
 * @param {string} args.contactEmail String of customer admin contact email as POC
 */
export const getMissingSubsidyReasonActions = ({
  reasonType,
  enterpriseAdminUsers,
  contactEmail,
}) => {
  const hasLimitsLearnMoreCTA = [
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
  ].includes(reasonType);
  const hasDeactivationLearnMoreCTA = [
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
  ].includes(reasonType);
  const hasContactAdministratorCTA = [
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
    DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED,
    DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED,
  ].includes(reasonType);

  if (hasLimitsLearnMoreCTA) {
    ensureConfig(['LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL']);
    return (
      <Button
        as={Hyperlink}
        className="text-center"
        destination={getConfig().LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL}
        target="_blank"
        size="sm"
        block
      >
        Learn about limits
      </Button>
    );
  }

  if (hasDeactivationLearnMoreCTA) {
    ensureConfig(['LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL']);
    return (
      <Button
        as={Hyperlink}
        className="text-center"
        destination={getConfig().LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL}
        target="_blank"
        size="sm"
        block
      >
        Learn about deactivation
      </Button>
    );
  }

  if (hasContactAdministratorCTA) {
    if (enterpriseAdminUsers?.length === 0) {
      return null;
    }

    let adminEmails = null;
    if (contactEmail) {
      adminEmails = contactEmail;
    } else if (enterpriseAdminUsers.length >= 1) {
      adminEmails = enterpriseAdminUsers.map(({ email }) => email).join(',');
    }

    return (
      <Button
        as={MailtoLink}
        className="text-center"
        to={adminEmails}
        target="_blank"
        size="sm"
        block
      >
        Contact administrator
        <span className="sr-only">for help</span>
      </Button>
    );
  }

  return null;
};

export const getMissingApplicableSubsidyReason = ({
  enterpriseAdminUsers,
  contactEmail,
  catalogsWithCourse,
  couponCodes,
  couponsOverview,
  customerAgreement,
  subscriptionLicense,
  containsContentItems,
  missingSubsidyAccessPolicyReason,
  enterpriseOffers,
}) => {
  // Default disabled enrollment reason, assumes enterprise customer does not have any administrator users.
  let reasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS;
  let userMessage = null;
  const hasEnterpriseAdminUsers = !!enterpriseAdminUsers?.length > 0;
  // If there are admin users, change `reasonType` to use the
  // `DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY` message.
  if (hasEnterpriseAdminUsers) {
    reasonType = DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY;
  }
  const couponCodesDisabledEnrollmentReasonType = getCouponCodesDisabledEnrollmentReasonType({
    catalogsWithCourse,
    couponCodes,
    couponsOverview,
    hasEnterpriseAdminUsers,
  });
  const subscriptionsDisabledEnrollmentReasonType = getSubscriptionDisabledEnrollmentReasonType({
    customerAgreement,
    catalogsWithCourse,
    subscriptionLicense,
    hasEnterpriseAdminUsers,
  });
  const enterpriseOffersDisabledEnrollmentReasonType = getEnterpriseOffersDisabledEnrollmentReasonType({
    enterpriseOffers,
    catalogsWithCourse,
  });

  /**
   * Prioritize the following order of disabled enrollment reasons:
   * 1. Course not in catalog
   * 2. Subscriptions related disabled enrollment reason
   * 3. Coupon codes related disabled enrollment reason
   * 4. Learner Credit related disabled enrollment reason.
   * 5. Enterprise offers related disabled enrollment reason
   */
  switch (true) {
    case !containsContentItems:
      reasonType = DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG;
      break;

    case !!subscriptionsDisabledEnrollmentReasonType:
      reasonType = subscriptionsDisabledEnrollmentReasonType;
      break;

    case !!couponCodesDisabledEnrollmentReasonType:
      reasonType = couponCodesDisabledEnrollmentReasonType;
      break;

    case !!missingSubsidyAccessPolicyReason:
      reasonType = missingSubsidyAccessPolicyReason.reason;
      userMessage = missingSubsidyAccessPolicyReason.userMessage || null;
      break;

    case !!enterpriseOffersDisabledEnrollmentReasonType:
      reasonType = enterpriseOffersDisabledEnrollmentReasonType;
      break;

    default:
      break;
  }

  return {
    reason: reasonType,
    userMessage: userMessage || DISABLED_ENROLL_USER_MESSAGES[reasonType],
    actions: getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers,
      contactEmail,
    }),
  };
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

export function getLinkToCourse(course, slug) {
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
    return parseFloat(entitlements[0].price);
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
export function getCoursePrice(course) {
  if (isDefinedAndNotNull(course.activeCourseRun?.fixedPriceUsd)) {
    return [parseFloat(course.activeCourseRun.fixedPriceUsd)];
  }
  if (isDefinedAndNotNull(course.activeCourseRun?.firstEnrollablePaidSeatPrice)) {
    return [course.activeCourseRun.firstEnrollablePaidSeatPrice];
  }
  if (course.entitlements.length > 0) {
    return [getEntitlementPrice(course.entitlements)];
  }
  return null;
}

/**
 * Transforms a value into a float with 2 decimal places.
 *
 * @param {*} value
 * @returns Casts value to a float and fixes it to 2 decimal places.
 */
export const fixDecimalNumber = (value) => parseFloat(value).toFixed(2);

export const getCourseOrganizationDetails = (courseData) => {
  const organizationDetails = {};
  if (courseData?.organizationShortCodeOverride) {
    organizationDetails.organizationName = courseData.organizationShortCodeOverride;
  } else {
    organizationDetails.organizationName = courseData?.owners[0]?.name;
  }
  if (courseData?.organizationLogoOverrideUrl) {
    organizationDetails.organizationLogo = courseData.organizationLogoOverrideUrl;
  } else {
    organizationDetails.organizationLogo = courseData?.owners[0]?.logoImageUrl;
  }

  organizationDetails.organizationMarketingUrl = courseData?.owners[0]?.marketingUrl;
  organizationDetails.organizationKey = courseData?.owners[0]?.key;
  organizationDetails.organizationUuid = courseData?.owners[0]?.uuid;

  return organizationDetails;
};

/**
 * Determines the start date for the the course run, pulling ONLY from the metadata of the run.
 *
 * Historically, for some course types we would derive certain fields from `contentMetadata.additionalMetadata`, but now
 * that additionalMetadata is being phased out we only read from course run metadata.
 *
 * @param {Object} args
 * @param {Object} args.courseRun
 *
 * @returns {string|undefined} Formatted date if a start date was found; otherwise, undefined.
 */
export const getCourseStartDate = ({ courseRun }) => courseRun?.start;

export function processCourseSubjects(course) {
  const config = getConfig();
  if (!course?.subjects?.length) {
    return { subjects: [], primarySubject: null };
  }
  return {
    subjects: course.subjects,
    primarySubject: {
      ...course.subjects[0],
      url: `${config.MARKETING_SITE_BASE_URL}/course/subject/${course.subjects[0].slug}`,
    },
  };
}

export function transformedCourseMetadata({
  transformed, coursePrice, currency, courseRunKey,
}) {
  const { activeCourseRun, courseRuns } = transformed;
  const courseRun = courseRuns.find(run => run.key === courseRunKey) || activeCourseRun;
  const organizationDetails = getCourseOrganizationDetails(transformed);
  const getDuration = () => {
    if (!courseRun) {
      return '-';
    }
    let duration = `${courseRun.weeksToComplete} Week`;
    if (courseRun.weeksToComplete > 1) {
      duration += 's';
    }
    return duration;
  };
  const minimalCourseMetadata = {
    organization: {
      logoImgUrl: organizationDetails.organizationLogo,
      name: organizationDetails.organizationName,
      marketingUrl: organizationDetails.organizationMarketingUrl,
    },
    title: transformed.title,
    startDate: getCourseStartDate({ courseRun }),
    duration: getDuration(),
    priceDetails: {
      price: coursePrice.listRange,
      currency,
    },
  };
  return minimalCourseMetadata;
}

/**
 * Takes assignments with the earliestPossibleExpirationDate field and sorts by the
 * soonest expiring expiration date, along with returns relevant metadata
 *
 * @param assignmentObjectArray
 * @param dateFormat
 * @returns {
 *  {
 *    date: (*|string),
 *    reason: string,
 *    sortedExpirationDateData: *,
 *    soonestExpirationDateData: *
 *   } |
 *   {
 *    date: null,
 *    reason: null,
 *    sortedExpirationDateData: null
 *   } |
 *   {
 *    date: null,
 *    reason: null,
 *    sortedByExpirationDate: null
 *   }
 * }
 */
export function getSoonestEarliestPossibleExpirationData({
  assignments,
  dateFormat = null,
}) {
  if (!assignments?.length) {
    logError('[getSoonestEarliestPossibleExpirationData] no assignments provided in array');
    return {
      soonestExpirationDate: null,
      soonestExpirationReason: null,
      soonestExpiringAssignment: null,
      sortedExpirationAssignments: null,
    };
  }
  const assignmentsWithExpiration = assignments.filter(
    assignment => !!assignment.earliestPossibleExpiration,
  );
  if (!assignmentsWithExpiration.length) {
    logError(`[getSoonestEarliestPossibleExpirationData] [${assignments.map((assignment) => assignment.uuid).join(', ')}] allocated assignment uuids do not contain earliestPossibleExpiration field`);
    return {
      soonestExpirationDate: null,
      soonestExpirationReason: null,
      soonestExpiringAssignment: null,
      sortedExpirationAssignments: null,
    };
  }

  const sortedByExpirationDate = assignmentsWithExpiration.sort(
    (a, b) => (dayjs(a.earliestPossibleExpiration.date).isBefore(b.earliestPossibleExpiration.date) ? -1 : 1),
  );
  let soonestExpirationDate = sortedByExpirationDate[0].earliestPossibleExpiration.date;
  if (dateFormat) {
    soonestExpirationDate = dayjs(soonestExpirationDate).format(dateFormat);
  }
  return {
    soonestExpirationDate,
    soonestExpirationReason: sortedByExpirationDate[0].earliestPossibleExpiration.reason,
    soonestExpiringAssignment: sortedByExpirationDate[0],
    sortedExpirationAssignments: sortedByExpirationDate,
  };
}
