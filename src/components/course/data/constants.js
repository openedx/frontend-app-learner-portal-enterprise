export const SET_COURSE_RUN = 'SET_COURSE_RUN';

// types of enroll butons supported
const enrollButtonTypesLocal = {
  ENROLL_DISABLED: 'enroll_disabled',
  TO_COURSEWARE_PAGE: 'to_courseware_page',
  VIEW_ON_DASHBOARD: 'view_on_dashboard',
  TO_DATASHARING_CONSENT: 'to_datasharing_consent',
  TO_ECOM_BASKET: 'to_ecom_basket',
  TO_VOUCHER_REDEEM: 'to_voucher_redeem',
};
export const enrollButtonTypes = Object.freeze(enrollButtonTypesLocal);

export const COURSE_PACING_MAP = {
  SELF_PACED: 'self_paced',
  INSTRUCTOR_PACED: 'instructor_paced',
};

export const SUBSIDY_DISCOUNT_TYPE_MAP = {
  PERCENTAGE: 'percentage',
  ABSOLUTE: 'absolute',
};

export const LICENSE_SUBSIDY_TYPE = 'license';

export const PROMISE_FULFILLED = 'fulfilled';

export const CURRENCY_USD = 'USD';

export const COURSE_AVAILABILITY_MAP = {
  UPCOMING: 'Upcoming',
  STARTING_SOON: 'Starting Soon',
  ARCHIVED: 'Archived',
};

export const ENROLL_BUTTON_LABEL_COMING_SOON = 'Coming Soon';
export const ENROLL_BUTTON_LABEL_NOT_AVAILABLE = 'Not Currently Available';

export const PROGRAM_TYPE_MAP = {
  MICROMASTERS: 'MicroMasters',
  CREDIT: 'Credit',
  XSERIES: 'XSeries',
  PROFESSIONAL_CERTIFICATE: 'Professional Certificate',
  MICROBACHELORS: 'MicroBachelors',
  MASTERS: 'Masters',
};

export const COURSE_MODES_MAP = {
  VERIFIED: 'verified',
  PROFESSIONAL: 'professional',
  NO_ID_PROFESSIONAL: 'no-id-professional',
  AUDIT: 'audit',
  HONOR: 'honor',
};

export const ENROLLMENT_FAILED_QUERY_PARAM = 'enrollment_failed';
