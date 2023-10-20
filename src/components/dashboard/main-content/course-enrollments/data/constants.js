export const FETCH_COURSE_ENROLLMENTS_REQUEST = 'FETCH_COURSE_ENROLLMENTS_REQUEST';
export const FETCH_COURSE_ENROLLMENTS_SUCCESS = 'FETCH_COURSE_ENROLLMENTS_SUCCESS';
export const FETCH_COURSE_ENROLLMENTS_FAILURE = 'FETCH_COURSE_ENROLLMENTS_FAILURE';
export const CLEAR_COURSE_ENROLLMENTS = 'CLEAR_COURSE_ENROLLMENTS';
export const UPDATE_COURSE_RUN_STATUS = 'UPDATE_COURSE_RUN_STATUS';
export const UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS = 'UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS';
export const UPDATE_IS_UNARCHIVE_COURSE_SUCCESS = 'UPDATE_IS_UNARCHIVE_COURSE_SUCCESS';
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

export const GETSMARTER_BASE_URL = 'https://www.getsmarter.com';
