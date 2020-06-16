import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  SET_COURSE_RUN, SET_COURSE, SET_ENROLLMENTS, SET_ENTITLEMENTS, SET_IS_COURSE_IN_CATALOG,
} from './data/constants';

export const CourseContext = createContext();
export const CourseContextConsumer = CourseContext.Consumer;

const reducer = (state, action) => {
  switch (action.type) {
    case SET_COURSE:
      return { ...state, course: action.payload };
    case SET_COURSE_RUN:
      return { ...state, activeCourseRun: action.payload };
    case SET_ENROLLMENTS:
      return { ...state, userEnrollments: action.payload };
    case SET_ENTITLEMENTS:
      return { ...state, userEntitlements: action.payload };
    case SET_IS_COURSE_IN_CATALOG:
      return {
        ...state,
        catalog: action.payload,
      };
    default:
      return state;
  }
};

export function CourseContextProvider({ children, initialState }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
}

CourseContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({
    course: PropTypes.shape({}).isRequired,
    activeCourseRun: PropTypes.shape({}).isRequired,
    userEnrollments: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    userEntitlements: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    catalog: PropTypes.shape({}).isRequired,
  }).isRequired,
};
