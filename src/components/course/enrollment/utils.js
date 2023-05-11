import { enrollButtonTypes } from './constants';
import { COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE, LICENSE_SUBSIDY_TYPE } from '../data/constants';

const {
  ENROLL_DISABLED,
  TO_COURSEWARE_PAGE,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  VIEW_ON_DASHBOARD,
  HIDE_BUTTON,
} = enrollButtonTypes;

/**
 * The main logic to determine enrollment type (scenario).
 */
export function determineEnrollmentType({
  subsidyData: {
    userSubsidyApplicableToCourse,
    subsidyRequestConfiguration,
  } = {},
  isUserEnrolled,
  isEnrollable,
  isCourseStarted,
  userHasSubsidyRequestForCourse,
  subsidyRequestCatalogsApplicableToCourse,
}) {
  if (isUserEnrolled) {
    return isCourseStarted ? TO_COURSEWARE_PAGE : VIEW_ON_DASHBOARD;
  }

  // Hide enroll button if browse and request is turned on and the user has no applicable subsidy
  const userCanRequestSubsidyForCourse = (
    subsidyRequestConfiguration?.subsidyRequestsEnabled
    && subsidyRequestCatalogsApplicableToCourse.size > 0
    && !userSubsidyApplicableToCourse
  );
  if (userHasSubsidyRequestForCourse || userCanRequestSubsidyForCourse) {
    return HIDE_BUTTON;
  }

  if (!isEnrollable || !userSubsidyApplicableToCourse) {
    return ENROLL_DISABLED;
  }

  if (userSubsidyApplicableToCourse.subsidyType === LICENSE_SUBSIDY_TYPE) {
    return TO_DATASHARING_CONSENT;
  }

  // If the user has a coupon code or an enterprise offer, we will redirect them to the checkout page
  // which takes care of redemption.
  const ecommerceSubsidyTypes = [COUPON_CODE_SUBSIDY_TYPE, ENTERPRISE_OFFER_SUBSIDY_TYPE];
  if (ecommerceSubsidyTypes.includes(userSubsidyApplicableToCourse.subsidyType)) {
    return TO_ECOM_BASKET;
  }

  return ENROLL_DISABLED;
}
