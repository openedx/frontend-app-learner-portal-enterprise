export const ENTERPRISE_OFFER_TYPE = {
  BOOKINGS_LIMIT: 'Bookings limit', // Offer has a global/user limit on the amount of spend
  ENROLLMENTS_LIMIT: 'Enrollments limit', // Offer has a global limit on number of enrollments
  BOOKINGS_AND_ENROLLMENTS_LIMIT: 'Bookings and enrollments limit', // Offer has a global limit on both the amount of spend and number of enrollments
  NO_LIMIT: 'No limit',
};

export const ENTERPRISE_OFFER_USAGE_TYPE = {
  PERCENTAGE: 'Percentage',
  ABSOLUTE: 'Absolute',
};

export const ENTERPRISE_OFFER_STATUS = {
  OPEN: 'Open',
  CONSUMED: 'Consumed',
};

export const ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD_RATIO = 0.1;
export const ENTERPRISE_OFFER_LOW_BALANCE_USER_THRESHOLD_DOLLARS = 149;
export const ENTERPRISE_OFFER_NO_BALANCE_THRESHOLD_DOLLARS = 99;
export const ENTERPRISE_OFFER_NO_BALANCE_USER_THRESHOLD_DOLLARS = 99;

export const LOW_BALANCE_ALERT_HEADING = 'Some courses may not be covered by your organization\'s learner credit balance';
export const LOW_BALANCE_ALERT_TEXT = 'Your organization is running low on learner credit. Some courses may no longer be covered. Please contact your administrator if you have questions.';
export const LOW_BALANCE_CONTACT_ADMIN_TEXT = 'Contact administrator';

export const NO_BALANCE_ALERT_HEADING = 'Courses are no longer covered by your organization\'s learner credit balance';
export const NO_BALANCE_ALERT_TEXT = 'Your learner credit balance has run out, and will not cover the cost of courses. Please contact your administrator if you have questions.';
export const NO_BALANCE_CONTACT_ADMIN_TEXT = 'Contact administrator';

export const OFFER_BALANCE_CLICK_EVENT = 'edx.ui.enterprise.learner_portal.offer_balance_alert.clicked';

export const ASSIGNMENT_TYPES = {
  ACCEPTED: 'accepted',
  ALLOCATED: 'allocated',
  CANCELED: 'cancelled',
  ERRORED: 'errored',
};

export const POLICY_TYPES = {
  ASSIGNED_CREDIT: 'AssignedLearnerCreditAccessPolicy',
  PER_LEARNER_CREDIT: 'PerLearnerSpendCreditAccessPolicy',
  PER_ENROLLMENT_CREDIT: 'PerLearnerEnrollmentCreditAccessPolicy',
};
