import { enrollButtonTypes } from './constants';
import {
  COUPON_CODE_SUBSIDY_TYPE,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from '../data/constants';
import { pathContainsCourseTypeSlug } from '../data/utils';

const {
  ENROLL_DISABLED,
  TO_COURSEWARE_PAGE,
  TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  VIEW_ON_DASHBOARD,
  HIDE_BUTTON,
} = enrollButtonTypes;

/**
 *
 * @param {*} couponsForSubsidyRequests Set of coupons
 * @returns True if none of the coupons have any remaining applications
 */
export function noAvailableCoupons(couponsForSubsidyRequests) {
  return couponsForSubsidyRequests?.every((coupon) => coupon?.numUnassigned === 0);
}

/**
 * Determines whether a user can request a subsidy for a course, by checking whether
 * the subsidy request feature is enabled, there are more than 1 subsidy request
 * catalogs applicable to the course, and whether the learner already has a subsidy
 * applicable to the course.
 *
 * @param {object} args
 * @param {object} args.subsidyRequestConfiguration Contains a property whether subsidy requests are enabled
 * @param {Set} args.subsidyRequestCatalogsApplicableToCourse Set representing the subsidy catalogs
 *  applicable to the course
 * @param {boolean} args.userSubsidyApplicableToCourse Subsidy applicable to the course
 *
 * @returns True if the user can request a subsidy for the course, false otherwise.
 */
export function canUserRequestSubsidyForCourse({
  subsidyRequestConfiguration,
  subsidyRequestCatalogsApplicableToCourse,
  userSubsidyApplicableToCourse,
  couponsForSubsidyRequests,
}) {
  // Hide enroll button if browse and request is turned on and the user has no applicable subsidy
  if (!subsidyRequestConfiguration || !subsidyRequestCatalogsApplicableToCourse) {
    return false;
  }
  return (
    subsidyRequestConfiguration.subsidyRequestsEnabled
    && subsidyRequestCatalogsApplicableToCourse.size > 0
    && !userSubsidyApplicableToCourse
    && !noAvailableCoupons(couponsForSubsidyRequests)
  );
}

/**
 * The main logic to determine enrollment type (scenario).
 */
export function determineEnrollmentType({
  subsidyData: { userSubsidyApplicableToCourse } = {},
  isUserEnrolled,
  isEnrollable,
  isCourseStarted,
  userHasSubsidyRequestForCourse,
  isExecutiveEducation2UCourse,
  userCanRequestSubsidyForCourse,
}) {
  if (isUserEnrolled) {
    return isCourseStarted ? TO_COURSEWARE_PAGE : VIEW_ON_DASHBOARD;
  }

  // Hide enroll button if learner can request a subsidy for the course, or
  // already has an pending subsidy request for the course.
  if (userHasSubsidyRequestForCourse || userCanRequestSubsidyForCourse) {
    return HIDE_BUTTON;
  }

  if (!isEnrollable || !userSubsidyApplicableToCourse) {
    return ENROLL_DISABLED;
  }

  if (userSubsidyApplicableToCourse.subsidyType === LICENSE_SUBSIDY_TYPE) {
    return TO_DATASHARING_CONSENT;
  }

  if (isExecutiveEducation2UCourse) {
    return TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT;
  }

  // If the user has a coupon code or an enterprise offer, we will redirect them to the checkout page
  // which takes care of redemption.
  const ecommerceSubsidyTypes = [COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE];
  if (ecommerceSubsidyTypes.includes(userSubsidyApplicableToCourse.subsidyType)) {
    return TO_ECOM_BASKET;
  }

  return ENROLL_DISABLED;
}

export function getExternalCourseEnrollmentUrl({
  currentRouteUrl,
}) {
  // TODO: See if we can make this generic, not linked to Exec Ed
  const isExecutiveEducation2UCourse = pathContainsCourseTypeSlug(currentRouteUrl, 'executive-education-2u');
  if (!isExecutiveEducation2UCourse) {
    return undefined;
  }
  return `${currentRouteUrl}/enroll`;
}
