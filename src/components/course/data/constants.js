import GetSmarterLogo from '../../../assets/icons/getsmarter-header-icon.svg';

// The SELF and INSTRUCTOR values are keys/value pairs used specifically for pacing sourced from the
// enterprise_course_enrollments API.
export const COURSE_PACING_MAP = {
  SELF_PACED: 'self_paced',
  INSTRUCTOR_PACED: 'instructor_paced',
  INSTRUCTOR: 'instructor',
  SELF: 'self',
};

export const SUBSIDY_DISCOUNT_TYPE_MAP = {
  PERCENTAGE: 'percentage',
  ABSOLUTE: 'absolute',
};

export const CURRENCY_USD = 'USD';

export const COURSE_RUN_AVAILABILITY = {
  UNPUBLISHED: 'unpublished',
  LEGAL_REVIEW: 'review_by_legal',
  INTERNAL_REVIEW: 'review_by_internal',
  REVIEWED: 'reviewed',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const SKILL_DESCRIPTION_CUTOFF_LIMIT = 950;
export const ELLIPSIS_STR = '...';

export const ENROLLMENT_FAILED_QUERY_PARAM = 'enrollment_failed';
export const ENROLLMENT_FAILURE_REASON_QUERY_PARAM = 'failure_reason';
export const ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM = 'course_run_key';

export const LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME = 'license-requested-alert-dismissed';
export const LICENSE_REQUESTED_ALERT_HEADING = 'Course requested';
/* eslint-disable-next-line max-len */
export const LICENSE_REQUESTED_ALERT_TEXT = 'Your organization\'s subscription covers all of the courses in this catalog. You have already requested access to all courses.';
export const UNPAID_EXECUTIVE_EDUCATION = 'unpaid-executive-education';
export const PAID_EXECUTIVE_EDUCATION = 'paid-executive-education';

export const REVIEW_SECTION_CONTENT = {
  DEMAND_AND_GROWTH: 'demand-and-growth',
  AVERAGE_RATING: 'average-rating',
  CONFIDENT_LEARNERS: 'confident-learners',
  MOST_COMMON_GOAL_LEARNERS: 'most-common-goal-learners',
};

export const EVENT_NAMES = {
  missingActiveCourseRun: 'edx.ui.enterprise.learner_portal.course.activeCourseRunNotFound',
  clickedToEnrollPage: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_enroll.clicked',
  sucessfulEnrollment: 'edx.ui.enterprise.learner_portal.course.enrolled',
  sucessfulExternalEnrollment: 'edx.ui.enterprise.learner_portal.course.external_enrollment_form.enrolled',
  sucessfulUpgradeEnrollment: 'edx.ui.enterprise.learner_portal.course.enrolled',
};

// TODO: Put logo in external repository and link to it with internal config
export const COURSE_TYPE_PARTNER_LOGOS = {
  'executive-education-2u': GetSmarterLogo,
};

export const REASON_USER_MESSAGES = {
  ORGANIZATION_NO_FUNDS: "You can't enroll right now because your organization doesn't have enough funds.",
  ORGANIZATION_NO_FUNDS_NO_ADMINS: "You can't enroll right now because your organization doesn't have enough funds. Contact your administrator about funds.",
  LEARNER_LIMITS_REACHED: "You can't enroll right now because of limits set by your organization.",
  CONTENT_NOT_IN_CATALOG: "You can't enroll right now because this course is no longer available in your organization's catalog.",
  ENTERPRISE_OFFER_EXPIRED: "You can't enroll right now because your offer expired.",
  SUBSCRIPTION_EXPIRED: "You can't enroll right now because your subscription expired.",
  SUBSCRIPTION_EXPIRED_NO_ADMINS: "You can't enroll right now because your subscription expired. Contact your administrator for help.",
  SUBSCRIPTION_DEACTIVATED: "You can't enroll right now because your subscription has been deactivated.",
  SUBSCRIPTION_DEACTIVATED_NO_ADMINS: "You can't enroll right now because your subscription has been deactivated. Contact your administrator for help.",
  SUBSCRIPTION_SEATS_EXHAUSTED: "You can't enroll right now because your organization doesn't have enough licenses.",
  SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS: "You can't enroll right now because your organization doesn't have enough licenses. Contact your administrator for help.",
  SUBSCRIPTION_LICENSE_NOT_ASSIGNED: "You can't enroll right now because you don't have a subscription license.",
  SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS: "You can't enroll right now because you don't have a subscription license. Contact your administrator for help.",
  COUPON_CODE_NOT_ASSIGNED: "You can't enroll right now because you don't have a code.",
  COUPON_CODE_NOT_ASSIGNED_NO_ADMINS: "You can't enroll right now because you don't have a code. Contact your administrator for help.",
  COUPON_CODES_EXPIRED: "You can't enroll right now because your code(s) expired.",
  COUPON_CODES_EXPIRED_NO_ADMINS: "You can't enroll right now because your code(s) expired. Contact your administrator for help.",
};

export const DISABLED_ENROLL_REASON_TYPES = {
  SUBSIDY_NOT_ACTIVE: 'subsidy_expired',
  POLICY_NOT_ACTIVE: 'policy_expired',
  CONTENT_NOT_IN_CATALOG: 'content_not_in_catalog',
  LEARNER_NOT_IN_ENTERPRISE: 'learner_not_in_enterprise',
  NOT_ENOUGH_VALUE_IN_SUBSIDY: 'not_enough_value_in_subsidy',
  LEARNER_MAX_SPEND_REACHED: 'learner_max_spend_reached',
  LEARNER_MAX_ENROLLMENTS_REACHED: 'learner_max_enrollments_reached',
  NO_SUBSIDY: 'no_subsidy',
  NO_SUBSIDY_NO_ADMINS: 'no_subsidy_no_admin',
  SUBSCRIPTION_DEACTIVATED: 'subscription_deactivated',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_EXPIRED_NO_ADMINS: 'subscription_expired_no_admin',
  SUBSCRIPTION_SEATS_EXHAUSTED: 'subscription_seats_exhausted',
  SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS: 'subscription_seats_exhausted_no_admin',
  SUBSCRIPTION_LICENSE_NOT_ASSIGNED: 'subscription_license_not_assigned',
  SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS: 'subscription_license_not_assigned_no_admin',
  ENTERPRISE_OFFER_EXPIRED: 'enterprise_offer_expired',
  POLICY_SPEND_LIMIT_REACHED: 'policy_spend_limit_reached',
  COUPON_CODE_NOT_ASSIGNED: 'coupon_code_not_assigned',
  COUPON_CODE_NOT_ASSIGNED_NO_ADMINS: 'coupon_code_not_assigned_no_admin',
  COUPON_CODES_EXPIRED: 'coupon_codes_expired',
  COUPON_CODES_EXPIRED_NO_ADMINS: 'coupon_codes_expired_no_admin',
};

/* eslint-disable max-len */
export const DISABLED_ENROLL_USER_MESSAGES = {
  [DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG]: REASON_USER_MESSAGES.CONTENT_NOT_IN_CATALOG,
  [DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS,
  [DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS,
  [DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED]: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
  [DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED]: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED]: REASON_USER_MESSAGES.SUBSCRIPTION_DEACTIVATED,
  [DISABLED_ENROLL_REASON_TYPES.ENTERPRISE_OFFER_EXPIRED]: REASON_USER_MESSAGES.ENTERPRISE_OFFER_EXPIRED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED]: REASON_USER_MESSAGES.SUBSCRIPTION_EXPIRED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS]: REASON_USER_MESSAGES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED]: REASON_USER_MESSAGES.SUBSCRIPTION_SEATS_EXHAUSTED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS]: REASON_USER_MESSAGES.SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED]: REASON_USER_MESSAGES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS]: REASON_USER_MESSAGES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED]: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED,
  [DISABLED_ENROLL_REASON_TYPES.COUPON_CODE_NOT_ASSIGNED_NO_ADMINS]: REASON_USER_MESSAGES.COUPON_CODE_NOT_ASSIGNED_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED]: REASON_USER_MESSAGES.COUPON_CODES_EXPIRED,
  [DISABLED_ENROLL_REASON_TYPES.COUPON_CODES_EXPIRED_NO_ADMINS]: REASON_USER_MESSAGES.COUPON_CODES_EXPIRED_NO_ADMINS,
};
/* eslint-enable max-len */

export const DATE_FORMAT = 'MMM D, YYYY';
export const DATETIME_FORMAT = 'MMM D, YYYY h:mma';
export const ZERO_PRICE = 0.00;
