import { SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX } from '../../../config/constants';

export const LICENSE_ACTIVATION_MESSAGE = 'Your license was successfully activated.';

export const COURSE_SECTION_TITLES = {
  current: 'My courses',
  completed: 'Completed courses',
  savedForLater: 'Saved for later',
  assigned: 'Assigned Courses',
  firstTimeUserAndAssigned: 'Your learning journey starts now!',
};

export const DASHBOARD_COURSES_TAB = 'courses';
export const DASHBOARD_PROGRAMS_TAB = 'programs';
export const DASHBOARD_PATHWAYS_TAB = 'pathways';
export const DASHBOARD_MY_CAREER_TAB = 'my-career';

export const DASHBOARD_TABS_SEGMENT_KEY = {
  [DASHBOARD_COURSES_TAB]: 'courses_tab',
  [DASHBOARD_PROGRAMS_TAB]: 'programs_tab',
  [DASHBOARD_PATHWAYS_TAB]: 'pathways_tab',
  [DASHBOARD_MY_CAREER_TAB]: 'career_tab',
};

export const BUDGET_STATUSES = {
  active: 'Active',
  expired: 'Expired',
  expiring: 'Expiring',
  scheduled: 'Scheduled',
  retired: 'Retired',
};

export const EXPIRED_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY = ({ uuid }) => (`hasSeenSubscriptionLicenseExpiredModal-${uuid}`);
export const EXPIRING_SUBSCRIPTION_MODAL_LOCALSTORAGE_KEY = ({ uuid, threshold }) => (`${SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX}${threshold}-${uuid}`);

export const ASSIGNMENTS_EXPIRING_WARNING_LOCALSTORAGE_KEY = 'enterprise.learner-portal.assignment-expiration-alert.dismissed.assignment.uuids';
