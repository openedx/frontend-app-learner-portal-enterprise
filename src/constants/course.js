// Constants related to courses
export const COURSE_MODES = {
  VERIFIED: 'verified',
  PROFESSIONAL: 'professional',
  NO_ID_PROFESSIONAL: 'no-id-professional',
  AUDIT: 'audit',
  HONOR: 'honor',
};

export const COURSE_STATUSES = {
  inProgress: 'in_progress',
  upcoming: 'upcoming',
  completed: 'completed',
  savedForLater: 'saved_for_later',
  // Not a real course status, represents a subsidy request.
  requested: 'requested',
};

export const COURSE_PACING = {
  INSTRUCTOR: 'instructor',
  SELF: 'self',
};
