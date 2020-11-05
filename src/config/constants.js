export const FEATURE_ENROLL_WITH_CODES = 'ENROLL_WITH_CODES';

// Subscription expiration constants
// LP only needs warnings within 60 days of expiration and past expiration
export const SUBSCRIPTION_DAYS_REMAINING_SEVERE = 60;
export const SUBSCRIPTION_EXPIRED = 0;

// Prefix for cookies that determine if the user has seen the modal for that range of expiration
// Using the same cookie name as Admin Portal so an Admin/Learner only sees the notification once
export const SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX = 'seen-expiration-modal-';
