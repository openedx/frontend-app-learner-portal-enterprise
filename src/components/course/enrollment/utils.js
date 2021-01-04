/* eslint-disable import/prefer-default-export */
import { enrollButtonTypes } from '../data/constants';

const {
  ENROLL_DISABLED,
  TO_COURSEWARE_PAGE,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  TO_VOUCHER_REDEEM,
  VIEW_ON_DASHBOARD,
} = enrollButtonTypes;

/**
 * The main logic to determine enrollment type (scenario).
 */
export function determineEnrollmentType({
  subsidyData: {
    subscriptionLicense, userSubsidy, enrollmentUrl, courseHasOffer,
  },
  isUserEnrolled,
  isEnrollable,
  isCourseStarted,
}) {
  if (isUserEnrolled) {
    return isCourseStarted ? TO_COURSEWARE_PAGE : VIEW_ON_DASHBOARD;
  }
  if (!isEnrollable) { return ENROLL_DISABLED; }
  if (!enrollmentUrl) { return ENROLL_DISABLED; }
  if (subscriptionLicense && userSubsidy) { return TO_DATASHARING_CONSENT; }
  if (subscriptionLicense && !userSubsidy) { return TO_ECOM_BASKET; }
  if (!subscriptionLicense && !courseHasOffer) { return TO_ECOM_BASKET; }
  if (!subscriptionLicense && courseHasOffer) { return TO_VOUCHER_REDEEM; }
  return ENROLL_DISABLED;
}
