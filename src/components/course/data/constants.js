import GetSmarterLogo from '../../../assets/icons/getsmarter-header-icon.svg';

export const COURSE_PACING_MAP = {
  SELF_PACED: 'self_paced',
  INSTRUCTOR_PACED: 'instructor_paced',
};

export const SUBSIDY_DISCOUNT_TYPE_MAP = {
  PERCENTAGE: 'percentage',
  ABSOLUTE: 'absolute',
};

export const LICENSE_SUBSIDY_TYPE = 'license';
export const COUPON_CODE_SUBSIDY_TYPE = 'couponCode';
export const ENTERPRISE_OFFER_SUBSIDY_TYPE = 'enterpriseOffer';
export const LEARNER_CREDIT_SUBSIDY_TYPE = 'learnerCredit';

export const PROMISE_FULFILLED = 'fulfilled';

export const CURRENCY_USD = 'USD';

export const COURSE_AVAILABILITY_MAP = {
  CURRENT: 'Current',
  UPCOMING: 'Upcoming',
  STARTING_SOON: 'Starting Soon',
  ARCHIVED: 'Archived',
};

export const SKILL_DESCRIPTION_PLACEHOLDER = 'No description available.';
export const SKILL_DESCRIPTION_CUTOFF_LIMIT = 950;
export const ELLIPSIS_STR = '...';

export const COURSE_MODES_MAP = {
  VERIFIED: 'verified',
  PROFESSIONAL: 'professional',
  NO_ID_PROFESSIONAL: 'no-id-professional',
  AUDIT: 'audit',
  HONOR: 'honor',
  PAID_EXECUTIVE_EDUCATION: 'paid-executive-education',
};

export const ENROLLMENT_FAILED_QUERY_PARAM = 'enrollment_failed';
export const ENROLLMENT_FAILURE_REASON_QUERY_PARAM = 'failure_reason';
export const ENROLLMENT_COURSE_RUN_KEY_QUERY_PARAM = 'course_run_key';

export const LICENSE_REQUESTED_ALERT_DISMISSED_COOKIE_NAME = 'license-requested-alert-dismissed';
export const LICENSE_REQUESTED_ALERT_HEADING = 'Course requested';
export const LICENSE_REQUESTED_ALERT_TEXT = 'Your organization’s subscription covers all of the courses in this catalog.'
                                    + ' You have already requested access to all courses.';
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
  sucessfulEnrollment: 'edx.ui.enterprise.learner_portal.course.external_enrollment_form.enrolled',
};

// TODO: Put logo in external repository and link to it with internal config
export const COURSE_TYPE_PARTNER_LOGOS = {
  'executive-education-2u': GetSmarterLogo,
};

export const REASON_USER_MESSAGES = {
  ORGANIZATION_NO_FUNDS: "You can't enroll right now because your organization doesn't have enough funds.",
  ORGANIZATION_NO_FUNDS_NO_ADMINS: "You can't enroll right now because your organization doesn't have enough funds. Contact your administrator to request more.",
  LEARNER_LIMITS_REACHED: "You can't enroll right now because of limits set by your organization.",
  CONTENT_NOT_IN_CATALOG: "You can't enroll right now because this course is no longer available in your organization's catalog.",
  SUBSCRIPTION_EXPIRED: "You can't enroll right now because your subscription expired.",
  SUBSCRIPTION_DEACTIVATED: "You can't enroll right now because your subscription has been deactivated.",
};
export const DISABLED_ENROLL_REASON_TYPES = {
  POLICY_NOT_ACTIVE: 'policy_not_active',
  CONTENT_NOT_IN_CATALOG: 'content_not_in_catalog',
  LEARNER_NOT_IN_ENTERPRISE: 'learner_not_in_enterprise',
  NOT_ENOUGH_VALUE_IN_SUBSIDY: 'not_enough_value_in_subsidy',
  LEARNER_MAX_SPEND_REACHED: 'learner_max_spend_reached',
  LEARNER_MAX_ENROLLMENTS_REACHED: 'learner_max_enrollments_reached',
  NO_SUBSIDY: 'no_subsidy',
  NO_SUBSIDY_NO_ADMINS: 'no_subsidy_no_admin',
  NO_ENROLLMENT_CODES_REMAINING: 'no_entrollment_codes_remaining',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_DEACTIVATED: 'subscription_deactivated',
};
export const DISABLED_ENROLL_USER_MESSAGES = {
  [DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG]: REASON_USER_MESSAGES.CONTENT_NOT_IN_CATALOG,
  [DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS,
  [DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY_NO_ADMINS]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS_NO_ADMINS,
  [DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY]: REASON_USER_MESSAGES.ORGANIZATION_NO_FUNDS,
  [DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED]: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
  [DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED]: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
  [DISABLED_ENROLL_REASON_TYPES.NO_ENROLLMENT_CODES_REMAINING]: REASON_USER_MESSAGES.LEARNER_LIMITS_REACHED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED]: REASON_USER_MESSAGES.SUBSCRIPTION_EXPIRED,
  [DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED]: REASON_USER_MESSAGES.SUBSCRIPTION_DEACTIVATED,
};

export const DATE_FORMAT = 'MMM D, YYYY';
