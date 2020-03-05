import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const initialState = {
  course: {},
  activeCourseRun: {},
  userEnrollments: [],
  userEntitlements: [],
};

export const CourseContext = createContext();
export const CourseContextConsumer = CourseContext.Consumer;

const reducer = (state, action) => {
  switch (action.type) {
    case 'set-course':
      return { ...state, course: action.payload };
    case 'set-course-run':
      return { ...state, activeCourseRun: action.payload };
    case 'set-enrollments':
      return { ...state, userEnrollments: action.payload };
    case 'set-entitlements':
      return { ...state, userEntitlements: action.payload };
    default:
      return state;
  }
};

export function CourseContextProvider({ children }) {
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
};
