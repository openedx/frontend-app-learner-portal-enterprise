import React, { createContext, useReducer } from 'react';
import PropTypes from 'prop-types';

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
    case 'set-is-course-in-catalog':
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
