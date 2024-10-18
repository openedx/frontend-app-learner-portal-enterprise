// Constants related to courses
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

// [ENT-9360] Restricted runs feature. Pass this slug to discovery API endpoints (param key is "include_restricted") to
// retrieve restricted runs. Find the same restriction type encoded in course run metadata under the `restriction_type`
// metadata key.
export const ENTERPRISE_RESTRICTION_TYPE = 'custom-b2b-enterprise';
