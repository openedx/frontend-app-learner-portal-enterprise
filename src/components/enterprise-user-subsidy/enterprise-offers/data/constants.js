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

export const ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD = 100; // dollar value amount threshold

export const LOW_BALANCE_ALERT_HEADING = 'Some courses may not be covered by your organization\'s learner credit balance';
export const LOW_BALANCE_ALERT_TEXT = 'Your organization is running low on learner credit. Some courses may no longer be covered. Please contact your administrator if you have questions.';
export const LOW_BALANCE_CONTACT_ADMIN_TEXT = 'Contact administrator';
