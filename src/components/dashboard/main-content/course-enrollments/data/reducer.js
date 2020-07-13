import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
  CLEAR_COURSE_ENROLLMENTS,
  UPDATE_COURSE_RUN_STATUS,
  UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS,
  UPDATE_IS_UNARCHIVE_COURSE_SUCCESS,
} from './constants';

const initialState = {
  isLoading: false,
  courseRuns: [],
  error: null,
  isMarkCourseCompleteSuccess: false,
  isMoveToInProgressCourseSuccess: false,
};

const courseEnrollmentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COURSE_ENROLLMENTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case FETCH_COURSE_ENROLLMENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        courseRuns: action.payload.data,
      };
    case FETCH_COURSE_ENROLLMENTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
    case UPDATE_COURSE_RUN_STATUS: {
      const { courseId, status, savedForLater } = action.payload;
      const courseRuns = [...state.courseRuns];
      const courseRunIndex = courseRuns.findIndex(run => run.courseRunId === courseId);
      if (courseRunIndex !== -1) {
        courseRuns[courseRunIndex].courseRunStatus = status;
        if (savedForLater) { courseRuns[courseRunIndex].savedForLater = savedForLater; }
        return {
          ...state,
          courseRuns,
        };
      }
      return {
        ...state,
      };
    }
    case UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS:
      return {
        ...state,
        isMarkCourseCompleteSuccess: action.payload.isSuccess,
      };
    case UPDATE_IS_UNARCHIVE_COURSE_SUCCESS:
      return {
        ...state,
        isMoveToInProgressCourseSuccess: action.payload.isSuccess,
      };
    case CLEAR_COURSE_ENROLLMENTS:
      return initialState;
    default:
      return state;
  }
};

export default courseEnrollmentsReducer;
