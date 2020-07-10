import { camelCaseObject } from '@edx/frontend-platform';

import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
  UPDATE_COURSE_RUN_STATUS,
  CLEAR_COURSE_ENROLLMENTS,
  UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS,
  UPDATE_IS_UNARCHIVE_COURSE_SUCCESS,
} from './constants';
import * as service from './service';

const fetchCourseEnrollmentsRequest = () => ({
  type: FETCH_COURSE_ENROLLMENTS_REQUEST,
});

const fetchCourseEnrollmentsSuccess = data => ({
  type: FETCH_COURSE_ENROLLMENTS_SUCCESS,
  payload: {
    data,
  },
});

const fetchCourseEnrollmentsFailure = error => ({
  type: FETCH_COURSE_ENROLLMENTS_FAILURE,
  payload: {
    error,
  },
});

const clearCourseEnrollmentsFn = () => ({ type: CLEAR_COURSE_ENROLLMENTS });

export const updateCourseRunStatus = ({ courseId, status, savedForLater }) => ({
  type: UPDATE_COURSE_RUN_STATUS,
  payload: {
    courseId,
    status,
    savedForLater,
  },
});

export const updateIsMarkCourseCompleteSuccess = ({ isSuccess }) => ({
  type: UPDATE_IS_MARK_COURSE_COMPLETE_SUCCESS,
  payload: {
    isSuccess,
  },
});

export const updateIsMoveToInProgressCourseSuccess = ({ isSuccess }) => ({
  type: UPDATE_IS_UNARCHIVE_COURSE_SUCCESS,
  payload: {
    isSuccess,
  },
});

const transformCourseEnrollmentsResponse = ({ responseData }) => {
  const camelCaseResponseData = camelCaseObject(responseData);
  return [...camelCaseResponseData];
};

export const fetchCourseEnrollments = options => (
  (dispatch) => {
    dispatch(fetchCourseEnrollmentsRequest());
    let serviceMethod;
    if (options.uuid) {
      serviceMethod = () => service.fetchEnterpriseCourseEnrollments(options.uuid);
    }
    if (serviceMethod) {
      return serviceMethod()
        .then((response) => {
          const transformedResponse = transformCourseEnrollmentsResponse({
            responseData: response.data,
          });
          dispatch(fetchCourseEnrollmentsSuccess(transformedResponse));
        })
        .catch((error) => {
          dispatch(fetchCourseEnrollmentsFailure(error));
        });
    }
    return undefined;
  }
);

export const clearCourseEnrollments = () => (
  (dispatch) => {
    dispatch(clearCourseEnrollmentsFn());
  }
);
