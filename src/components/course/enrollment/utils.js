/* eslint-disable import/prefer-default-export */
import { enrollButtonTypes } from './constants';
import { hasLicenseSubsidy } from '../data/utils';

const {
  ENROLL_DISABLED,
  TO_COURSEWARE_PAGE,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  TO_VOUCHER_REDEEM,
  VIEW_ON_DASHBOARD,
  HIDE_BUTTON,
} = enrollButtonTypes;

/**
 * The main logic to determine enrollment type (scenario).
 */
export function determineEnrollmentType({
  subsidyData: {
    subscriptionLicense, userSubsidyApplicableToCourse, enrollmentUrl, courseHasOffer,
  } = {},
  isUserEnrolled,
  isEnrollable,
  isCourseStarted,
  userHasSubsidyRequestForCourse,
}) {
  const isSubscriptionValid = subscriptionLicense?.uuid;
  if (isUserEnrolled) {
    return isCourseStarted ? TO_COURSEWARE_PAGE : VIEW_ON_DASHBOARD;
  }

  if (userHasSubsidyRequestForCourse) { return HIDE_BUTTON; }

  if (!isEnrollable) { return ENROLL_DISABLED; }
  if (!enrollmentUrl) { return ENROLL_DISABLED; }

  if (isSubscriptionValid && hasLicenseSubsidy(userSubsidyApplicableToCourse)) {
    return TO_DATASHARING_CONSENT;
  }
  if (isSubscriptionValid && !hasLicenseSubsidy(userSubsidyApplicableToCourse)) {
    return TO_ECOM_BASKET;
  }

  if (!isSubscriptionValid && courseHasOffer) { return TO_VOUCHER_REDEEM; }
  if (!isSubscriptionValid && !courseHasOffer) { return TO_ECOM_BASKET; }
  return ENROLL_DISABLED;
}
