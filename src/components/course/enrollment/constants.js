const enrollButtonTypesLocal = {
  ENROLL_DISABLED: 'enroll_disabled',
  TO_COURSEWARE_PAGE: 'to_courseware_page',
  TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT: 'TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT',
  VIEW_ON_DASHBOARD: 'view_on_dashboard',
  TO_DATASHARING_CONSENT: 'to_datasharing_consent',
  TO_ECOM_BASKET: 'to_ecom_basket',
  HIDE_BUTTON: 'hide_button',
};

export const EVENT_NAMES = {
  clickedToEnrollPage: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_enroll.clicked',
};

export const enrollButtonTypes = Object.freeze(enrollButtonTypesLocal);
