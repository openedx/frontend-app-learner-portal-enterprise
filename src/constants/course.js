// Constants related to courses
export const COURSE_MODES = {
  VERIFIED: 'verified',
  PROFESSIONAL: 'professional',
  NO_ID_PROFESSIONAL: 'no-id-professional',
  AUDIT: 'audit',
  HONOR: 'honor',
  EXECUTIVE_EDUCATION: 'executive-education',
  PAID_EXECUTIVE_EDUCATION: 'paid-executive-education',
  UNPAID_EXECUTIVE_EDUCATION: 'unpaid-executive-education',
  EXECUTIVE_EDUCATION_2U: 'executive-education-2u',
  CREDIT_VERIFIED_AUDIT: 'credit-verified-audit',
  VERIFIED_AUDIT: 'verified-audit',
};

export const EXECUTIVE_EDUCATION_COURSE_MODES = [
  COURSE_MODES.EXECUTIVE_EDUCATION,
  COURSE_MODES.PAID_EXECUTIVE_EDUCATION,
  COURSE_MODES.UNPAID_EXECUTIVE_EDUCATION,
  COURSE_MODES.EXECUTIVE_EDUCATION_2U,
];

export const COURSE_STATUSES = {
  inProgress: 'in_progress',
  upcoming: 'upcoming',
  completed: 'completed',
  savedForLater: 'saved_for_later',
  // Not a real course status, represents a subsidy request.
  requested: 'requested',
  // Not a real course status, represents a course assignment.
  assigned: 'assigned',
};

export const COURSE_PACING = {
  INSTRUCTOR: 'instructor',
  SELF: 'self',
};
