export const SET_COURSE_RUN = 'SET_COURSE_RUN';

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
};
